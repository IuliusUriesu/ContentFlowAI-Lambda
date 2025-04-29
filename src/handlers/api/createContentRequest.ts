import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse } from "../helpers/successResponse";
import { errorResponse } from "../helpers/errorResponse";
import { getEnvVariable, LlmResponseParsingError } from "../../utils/utils";
import { CreateContentRequestBodySchema } from "../../models/api/CreateContentRequestBody";
import { ContentRequestDto } from "../../models/dto/ContentRequestDto";
import DynamoDbServiceProvider from "../../services/dynamodb";
import AnthropicApiServiceProvider from "../../services/anthropic-api";
import SqsServiceProvider from "../../services/sqs";

const createContentRequest = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const sub = event.requestContext.authorizer?.claims.sub;

    if (!sub) {
        return errorResponse(event, 401, "Claim 'sub' (user ID) is missing.");
    }

    if (!event.body) {
        return errorResponse(event, 400, "Request body is empty.");
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return errorResponse(event, 400, "Request body is invalid JSON.");
    }

    const parsedBody = CreateContentRequestBodySchema.safeParse(body);
    if (!parsedBody.success) {
        const issues = parsedBody.error.issues;
        const errorMessage = issues.length > 0 ? issues[0].message : "Request body is invalid.";
        return errorResponse(event, 400, errorMessage);
    }

    const contentRequestDto: ContentRequestDto = parsedBody.data;

    const dynamoDbService = DynamoDbServiceProvider.getService();
    const anthropicApiService = AnthropicApiServiceProvider.getService();
    const sqsService = SqsServiceProvider.getService();

    try {
        const conciseIdeaContextPrompt = createConciseIdeaContextPrompt(contentRequestDto.ideaContext);
        const claudeResponse = await anthropicApiService.getClaudeResponse({ prompt: conciseIdeaContextPrompt });
        const conciseIdeaContext = extractConciseIdeaContext(claudeResponse);

        const createdContentRequest = await dynamoDbService.createContentRequest({
            userId: sub,
            contentRequest: contentRequestDto,
            conciseIdeaContext,
        });

        const contentRequestQueueUrl = getEnvVariable("CONTENT_REQUEST_QUEUE_URL");
        await sqsService.sendContentRequestMessage({
            message: { userId: sub, contentRequestId: createdContentRequest.id, contentRequest: contentRequestDto },
            queueUrl: contentRequestQueueUrl,
        });

        return successResponse(event, 201, createdContentRequest);
    } catch (error) {
        console.log(error);
        return errorResponse(event, 500, "Internal server error");
    }
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
