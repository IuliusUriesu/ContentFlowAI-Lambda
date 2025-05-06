import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent, SQSHandler } from "aws-lambda";
import { SqsBrandSummaryRequestMessageSchema } from "../../services/sqs/types";
import { BrandDetailsCreateDto } from "../../models/dto/BrandDetailsCreateDto";
import { ContentPieceCreateDto } from "../../models/dto/ContentPieceCreateDto";
import DynamoDbServiceProvider from "../../services/dynamodb";
import AnthropicApiServiceProvider from "../../services/anthropic-api";

const writeBrandSummary: SQSHandler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    const batchItemFailures: SQSBatchItemFailure[] = [];

    const messages: {
        messageId: string;
        userId: string;
        claudeResponsePromise: Promise<string>;
    }[] = [];

    const dynamoDbService = DynamoDbServiceProvider.getService();

    for (const record of event.Records) {
        let body: unknown;
        try {
            body = JSON.parse(record.body);
            const message = SqsBrandSummaryRequestMessageSchema.parse(body);
            const { userId, brandDetails, existingContent } = message;

            const anthropicApiService = await AnthropicApiServiceProvider.fromUserId(userId);

            const userProfile = await dynamoDbService.getUserProfile({ userId });
            if (userProfile && userProfile.brandSummary) {
                console.log(`Brand summary already exists for user ${userProfile.fullName}. Skipping record...`);
                continue;
            }

            const prompt = createBrandSummaryPrompt(brandDetails, existingContent);
            const claudeResponsePromise = anthropicApiService.getClaudeResponse({ prompt, thinking: true });
            messages.push({ messageId: record.messageId, userId, claudeResponsePromise });
        } catch (error) {
            console.log(error);
            batchItemFailures.push({ itemIdentifier: record.messageId });
        }
    }

    for (const message of messages) {
        const { userId, claudeResponsePromise, messageId } = message;

        try {
            const brandSummary = await claudeResponsePromise;
            await dynamoDbService.updateBrandSummary({ userId, brandSummary });
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

const createBrandSummaryPrompt = (
    brandDetails: BrandDetailsCreateDto,
    existingContent: ContentPieceCreateDto[],
): string => {
    const brandDetailsXml =
        "<brand_details>\n" +
        `<brand_themes>${brandDetails.brandThemes}</brand_themes>\n` +
        `<tone_of_voice>${brandDetails.toneOfVoice}</tone_of_voice>\n` +
        `<target_audience>${brandDetails.targetAudience}</target_audience>\n` +
        `<content_goals>${brandDetails.contentGoals}</content_goals>\n` +
        "</brand_details>";

    let existingContentXml = "<existing_content>\n";
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
        "You are an experienced branding specialist with expertise in social media personal branding. " +
        "Your task is to analyze some details about a personal brand, including existing content, and " +
        "to write a brand summary.\n\n" +
        "Personal brand details and existing content:\n" +
        `${brandDetailsXml}\n\n${existingContentXml}\n\n` +
        "Consider the following steps:\n" +
        "1. Analyze the brand themes, identifying key concepts and how they are expressed.\n" +
        "2. Examine the tone of voice, noting specific language patterns and styles.\n" +
        "3. Break down the target audience characteristics and how the existing content resonates with them.\n" +
        "4. List the content goals and how they relate to brand and audience.\n" +
        "5. Identify key elements that set this brand apart.\n\n" +
        "Rules:\n" +
        "1. Write the summary in paragraphs separated by new lines, without any additional formatting.\n" +
        "2. Write the summary in an objective, neutral manner.\n" +
        "3. You must output only the brand summary text, without anything else.\n";

    return prompt;
};

export default writeBrandSummary;
