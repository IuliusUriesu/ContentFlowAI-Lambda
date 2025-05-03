import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent, SQSHandler } from "aws-lambda";
import { SqsContentRequestMessageSchema } from "../../services/sqs/types";
import { shuffleArray } from "../../utils/utils";
import { ContentPieceCreateDto } from "../../models/dto/ContentPieceCreateDto";
import { ContentRequestCreateDto } from "../../models/dto/ContentRequestCreateDto";
import { GeneratedContentPieceCreateDto } from "../../models/dto/GeneratedContentPieceCreateDto";
import { ContentPiece } from "../../models/domain/ContentPiece";
import DynamoDbServiceProvider from "../../services/dynamodb";
import createAnthropicApiService from "../../services/anthropic-api";

const generateContent: SQSHandler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    const batchItemFailures: SQSBatchItemFailure[] = [];

    const claudeResponsePromises: {
        messageId: string;
        userId: string;
        contentRequestId: string;
        contentFormat: string;
        claudeResponsePromise: Promise<string>;
    }[] = [];

    const dynamoDbService = DynamoDbServiceProvider.getService();

    for (const record of event.Records) {
        let body: unknown;
        try {
            body = JSON.parse(record.body);
            const message = SqsContentRequestMessageSchema.parse(body);

            const { userId, contentRequestId, contentRequest } = message;

            const anthropicApiService = await createAnthropicApiService(userId);

            const userRequest = await dynamoDbService.getContentRequest({
                userId,
                contentRequestId,
            });

            if (userRequest && userRequest.isRequestProcessed === true) {
                console.log(`Request ${contentRequestId} is already processed. Skipping record...`);
                continue;
            }

            const userProfile = await dynamoDbService.getUserProfile({ userId });
            const postedContent = await dynamoDbService.getPostedContent({ userId });

            if (!userProfile || typeof userProfile.brandSummary !== "string") {
                throw new Error("Brand summary is missing.");
            }

            const existingContent = selectContent(postedContent, contentRequest.contentFormat);

            const prompt = createContentRequestPrompt(userProfile.brandSummary, existingContent, contentRequest);
            const claudeResponsePromise = anthropicApiService.getClaudeResponse({ prompt, thinking: true });
            claudeResponsePromises.push({
                messageId: record.messageId,
                userId,
                contentRequestId,
                contentFormat: contentRequest.contentFormat,
                claudeResponsePromise,
            });
        } catch (error) {
            console.log(error);
            batchItemFailures.push({ itemIdentifier: record.messageId });
        }
    }

    for (const promise of claudeResponsePromises) {
        const { userId, contentRequestId, contentFormat, claudeResponsePromise, messageId } = promise;

        try {
            const claudeResponse = await claudeResponsePromise;
            const generatedContent = extractGeneratedContentPieces(claudeResponse);

            await dynamoDbService.createGeneratedContentPieces({
                userId,
                contentRequestId,
                contentFormat,
                generatedContent,
            });

            await dynamoDbService.updateIsContentRequestProcessed({
                userId,
                contentRequestId,
                isRequestProcessed: true,
            });
        } catch (error) {
            console.log(error);
            batchItemFailures.push({ itemIdentifier: messageId });
        }
    }

    if (batchItemFailures.length > 0) {
        console.log("Failed messages:");
        console.log(batchItemFailures);
    }
    return { batchItemFailures };
};

const selectContent = (postedContent: ContentPiece[], contentRequestFormat: string): ContentPieceCreateDto[] => {
    let limit = 10;
    let sameFormatContent: ContentPieceCreateDto[] = [];
    let differentFormatContent: ContentPieceCreateDto[] = [];
    const selectedContent: ContentPieceCreateDto[] = [];

    for (const contentPiece of postedContent) {
        const { format, content } = contentPiece;

        if (format === contentRequestFormat) {
            sameFormatContent.push({ format: contentRequestFormat, content });
        } else {
            differentFormatContent.push({ format, content });
        }
    }

    sameFormatContent = shuffleArray(sameFormatContent);
    for (let i = 0; i < sameFormatContent.length && limit > 0; i++) {
        selectedContent.push(sameFormatContent[i]);
        limit--;
    }

    if (limit > 0) {
        differentFormatContent = shuffleArray(differentFormatContent);
        for (let i = 0; i < differentFormatContent.length && limit > 0; i++) {
            selectedContent.push(differentFormatContent[i]);
            limit--;
        }
    }

    return selectedContent;
};

const createContentRequestPrompt = (
    brandSummary: string,
    existingContent: ContentPieceCreateDto[],
    contentRequest: ContentRequestCreateDto,
): string => {
    let existingContentXml = "<existing_content>\n";

    if (existingContent.length === 0) {
        existingContentXml += "[No existing content provided]\n";
    }

    for (const contentPiece of existingContent) {
        const contentPieceXml =
            "<content_piece>\n" +
            `<format>${contentPiece.format}</format>\n` +
            `<content>\n${contentPiece.content}\n</content>\n` +
            "</content_piece>";

        existingContentXml += contentPieceXml + "\n";
    }

    existingContentXml += "</existing_content>";

    const prompt =
        "You are an experienced content creator specializing in social media content and personal branding. " +
        "Your task is to analyze the personal brand of the user, brainstorm ideas that strongly resonate with the brand, " +
        "and generate value-packed content that aligns with the user's established identity.\n\n" +
        "First, review the following brand summary:\n" +
        `<brand_summary>\n${brandSummary}\n</brand_summary>\n\n` +
        "Next, examine the following existing content of the brand:\n" +
        `${existingContentXml}\n\n` +
        "The ideas (and the content) must revolve around the context provided by the user:\n" +
        `<idea_context>${contentRequest.ideaContext}</idea_context>\n\n` +
        "The content must be written in a specific format:\n" +
        `<content_format>${contentRequest.contentFormat}</content_format>\n\n` +
        "Before generating the ideas and the content, analyze all the provided information. Wrap your analysis " +
        "with <analysis> tags inside your thinking block. Consider the following steps:\n" +
        "1. Analyze the brand summary and existing content, identifying: key themes and how they are expressed, " +
        "tone of voice and specific language patterns, how the content resonates with the target audience, key " +
        "elements that set this brand apart.\n" +
        `2. Brainstorm ${contentRequest.contentPiecesCount} fresh ideas, angles, or perspectives that strongly resonate with ` +
        "the brand, and briefly describe them. It is crucial that provided context is taken into consideration.\n" +
        "3. Evaluate how well the ideas align with the brand and refine if necessary.\n" +
        "4. Consider how to adapt the ideas to the requested content format. The existing pieces of content " +
        "written in the same format serve as examples.\n\n" +
        `After you finished thinking, create ${contentRequest.contentPiecesCount} value-packed content pieces in the requested ` +
        "format. Ensure that each content piece:\n" +
        "- Delivers value\n" +
        "- Stays true to the brand's authenticity and tone of voice\n" +
        "- Resonates with the target audience\n\n" +
        "You must present each content piece in the following way:\n\n" +
        "<content_piece>\n<idea>\n[Describe the idea in 1-3 sentences]\n</idea>\n" +
        "<content>\n[Insert the actual content here]\n</content>\n</content_piece>\n\n" +
        "Wrap all content pieces with <new_content> tags.\n\n" +
        "Your final output must consist only of the generated content within (and including) the <new_content> tags. " +
        "Do not repeat anything from your thinking process. Do not add any other additional text or formatting.";

    return prompt;
};

const extractGeneratedContentPieces = (claudeResponse: string): GeneratedContentPieceCreateDto[] => {
    const generatedContentPieces: GeneratedContentPieceCreateDto[] = [];

    const contentPieceRegex = /<content_piece>(.*?)<\/content_piece>/gs;
    const allMatches = [...claudeResponse.matchAll(contentPieceRegex)];
    const contentPieces = allMatches.map((match) => match[1].trim());

    const ideaRegex = /<idea>(.*?)<\/idea>/s;
    const contentRegex = /<content>(.*?)<\/content>/s;

    for (const contentPiece of contentPieces) {
        const ideaMatch = contentPiece.match(ideaRegex);
        const contentMatch = contentPiece.match(contentRegex);
        if (ideaMatch && contentMatch) {
            generatedContentPieces.push({ idea: ideaMatch[1].trim(), content: contentMatch[1].trim() });
        }
    }

    return generatedContentPieces;
};

export default generateContent;
