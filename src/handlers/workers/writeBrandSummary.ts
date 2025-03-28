import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent, SQSHandler } from "aws-lambda";
import { SqsBrandSummaryRequestMessageSchema } from "../../services/sqs/types";
import { BrandDetails } from "../../models/BrandDetails";
import { ExistingContentPiece } from "../../models/ExistingContentPiece";
import AnthropicApiService from "../../services/anthropic-api/AnthropicApiService";
import DynamoDbService from "../../services/dynamodb/DynamoDbService";

const writeBrandSummary: SQSHandler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    const batchItemFailures: SQSBatchItemFailure[] = [];

    const anthropicApiService = new AnthropicApiService();
    const dynamoDbService = new DynamoDbService();

    const messageResponses: {
        messageId: string;
        userId: string;
        claudeResponsePromise: Promise<string>;
    }[] = [];

    for (const record of event.Records) {
        let body: unknown;
        try {
            body = JSON.parse(record.body);
            const message = SqsBrandSummaryRequestMessageSchema.parse(body);

            const userProfile = await dynamoDbService.getUserProfile({ userId: message.userId });
            if (userProfile && userProfile.brandSummary) {
                console.log("Brand summary exists. Skipping record...");
                continue;
            }

            const prompt = createBrandSummaryPrompt(message.brandDetails, message.existingContent);
            const claudeResponsePromise = anthropicApiService.getClaudeResponse({ prompt, thinking: true });
            messageResponses.push({ messageId: record.messageId, userId: message.userId, claudeResponsePromise });
        } catch (error) {
            console.log(error);
            batchItemFailures.push({ itemIdentifier: record.messageId });
        }
    }

    for (const response of messageResponses) {
        try {
            const brandSummary = await response.claudeResponsePromise;
            await dynamoDbService.updateBrandSummary({ userId: response.userId, brandSummary });
        } catch (error) {
            console.log(error);
            batchItemFailures.push({ itemIdentifier: response.messageId });
        }
    }

    return { batchItemFailures };
};

const createBrandSummaryPrompt = (brandDetails: BrandDetails, existingContent: ExistingContentPiece[]): string => {
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
