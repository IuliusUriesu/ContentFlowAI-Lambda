import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse } from "../helpers/successResponse";
import { errorResponse } from "../helpers/errorResponse";
import DynamoDbService from "../../services/dynamodb/DynamoDbService";
import SqsService from "../../services/sqs/SqsService";
import AnthropicApiService from "../../services/anthropic-api/AnthropicApiService";
import { ContentRequest } from "../../models/ContentRequest";
import { BadRequestError, getEnvVariable, LlmResponseParsingError } from "../../utils/utils";

const createContentRequest = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const sub = event.requestContext.authorizer?.claims.sub;

    if (!sub) {
        return errorResponse(event, 401, "Claim 'sub' (user ID) is missing.");
    }

    if (!event.body) {
        return errorResponse(event, 400, "Request body is empty.");
    }

    const dynamoDbService = new DynamoDbService();
    const sqsService = new SqsService();
    const anthropicApiService = new AnthropicApiService();

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return errorResponse(event, 400, "Request body is invalid JSON.");
    }

    let contentRequest: ContentRequest;
    try {
        contentRequest = extractContentRequest(body);
    } catch (error) {
        return errorResponse(event, 400, (error as Error).message);
    }

    try {
        const conciseIdeaContextPrompt = createConciseIdeaContextPrompt(contentRequest.ideaContext);
        const claudeResponse = await anthropicApiService.getClaudeResponse({ prompt: conciseIdeaContextPrompt });
        const conciseIdeaContext = extractConciseIdeaContext(claudeResponse);

        const createdContentRequest = await dynamoDbService.createContentRequest({
            userId: sub,
            contentRequest,
            conciseIdeaContext,
        });

        const contentRequestQueueUrl = getEnvVariable("CONTENT_REQUEST_QUEUE_URL");
        await sqsService.sendContentRequestMessage({
            message: { userId: sub, contentRequestFullId: createdContentRequest.SK, contentRequest },
            queueUrl: contentRequestQueueUrl,
        });

        return successResponse(event, 201, createdContentRequest);
    } catch (error) {
        console.log(error);
        return errorResponse(event, 500, "Internal server error");
    }
};

const extractContentRequest = (body: any): ContentRequest => {
    let { ideaContext, contentFormat, contentPiecesCount } = body;

    if (!ideaContext || typeof ideaContext !== "string") {
        throw new BadRequestError("Required field 'ideaContext' is missing or invalid.");
    }

    if (!contentFormat || typeof contentFormat !== "string") {
        throw new BadRequestError("Required field 'contentFormat' is missing or invalid.");
    }

    if (!contentPiecesCount || typeof contentPiecesCount !== "number" || contentPiecesCount <= 0) {
        throw new BadRequestError("Required field 'contentPiecesCount' is missing or invalid.");
    }

    contentPiecesCount = Math.floor(contentPiecesCount);
    contentPiecesCount = Math.min(contentPiecesCount, 20);

    return { ideaContext, contentFormat, contentPiecesCount };
};

const createConciseIdeaContextPrompt = (ideaContext: string): string => {
    const prompt =
        "You are an AI assistant specialized in creating concise titles for content ideas. Your task is " +
        "to generate a short, descriptive title (3-8 words) based on a given 'idea context' for personal " +
        "brand content creation.\n\n" +
        "Here is the idea context provided by the user:\n" +
        `<idea_context>\n${ideaContext}\n</idea_context>\n\n` +
        "Consider the following:\n" +
        "1. The title should capture the essence of the idea context in 3-8 words.\n" +
        "2. Ensure that you use the user's original words as much as possible.\n\n" +
        "Before providing your final title, work through the following process inside <title_creation_process> tags:\n" +
        "1. List key concepts and important phrases from the idea context.\n" +
        "2. Brainstorm 3-5 potential titles.\n" +
        "3. Evaluate each title based on clarity and relevance to the idea context.\n" +
        "4. Choose the most informative title or refine if necessary.\n\n" +
        "Example of the expected output format:\n\n" +
        "<title_creation_process>\n[Your analysis and thought process here]\n</title_creation_process>\n\n" +
        "<final_title>\n[The final title here]\n</final_title>\n\n" +
        "Remember, the final output must not contain any formatting or additional text.";

    return prompt;
};

const extractConciseIdeaContext = (claudeResponse: string): string => {
    const regex = /<final_title>(.*?)<\/final_title>/s;
    const match = claudeResponse.match(regex);

    if (match) {
        return match[1].trim();
    } else {
        throw new LlmResponseParsingError("Failed to extract concise idea context.");
    }
};

export default createContentRequest;
