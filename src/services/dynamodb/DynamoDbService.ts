import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    BatchWriteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDbError, getEnvVariable } from "../../utils/utils";
import { v4 as uuidv4 } from "uuid";
import {
    DynamoDbContentRequest,
    DynamoDbContentRequestListSchema,
    DynamoDbContentRequestSchema,
    DynamoDbCreateContentRequestInput,
    DynamoDbCreateExistingContentPiecesInput,
    DynamoDbCreateGeneratedContentPiecesInput,
    DynamoDbCreateUserProfileInput,
    DynamoDbPostedContentPiece,
    DynamoDbGeneratedContentPiece,
    DynamoDbGeneratedContentPieceListSchema,
    DynamoDbGetAllContentRequestsInput,
    DynamoDbGetAllGeneratedContentByRequestInput,
    DynamoDbGetContentRequestInput,
    DynamoDbGetGeneratedContentPieceInput,
    DynamoDbGetPostedContentInput,
    DynamoDbGetUserProfileInput,
    DynamoDbUpdateBrandSummaryInput,
    DynamoDbUpdateIsContentRequestProcessedInput,
    DynamoDbUserProfile,
    DynamoDbUserProfileSchema,
    DynamoDbPostedContentPieceListSchema,
    DynamoDbGeneratedContentPieceSchema,
    DynamoDbUpdateGeneratedContentPieceContentInput,
    DynamoDbCreateUserAnthropicApiKeyInput,
    DynamoDbUserAnthropicApiKey,
    DynamoDbGetUserAnthropicApiKeyInput,
    DynamoDbUserAnthropicApiKeySchema,
} from "./types";
import { UserProfile } from "../../models/domain/UserProfile";
import { ContentPiece } from "../../models/domain/ContentPiece";
import { ContentRequest } from "../../models/domain/ContentRequest";
import { GeneratedContentPiece } from "../../models/domain/GeneratedContentPiece";
import { UserAnthropicApiKey } from "../../models/domain/UserAnthropicApiKey";

export class DynamoDbService {
    private docClient: DynamoDBDocumentClient;
    private appDataTableName: string;
    private generatedContentGsiName: string;

    constructor() {
        const awsRegion = getEnvVariable("AWS_REGION");
        const client = new DynamoDBClient({ region: awsRegion });
        this.docClient = DynamoDBDocumentClient.from(client);
        this.appDataTableName = getEnvVariable("APP_DATA_TABLE_NAME");
        this.generatedContentGsiName = getEnvVariable("GENERATED_CONTENT_GSI_NAME");
    }

    createUserProfile = async (input: DynamoDbCreateUserProfileInput): Promise<UserProfile> => {
        const { userId, fullName } = input;
        const { brandThemes, toneOfVoice, targetAudience, contentGoals } = input.brandDetails;

        const userProfileItem: DynamoDbUserProfile = {
            PK: `u#${userId}`,
            SK: "profile",
            fullName,
            brandThemes,
            toneOfVoice,
            targetAudience,
            contentGoals,
        };

        const command = new PutCommand({
            TableName: this.appDataTableName,
            Item: userProfileItem,
        });

        try {
            await this.docClient.send(command);
            return this.mapUserProfile(userProfileItem);
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to create user profile.");
        }
    };

    createExistingContentPieces = async (input: DynamoDbCreateExistingContentPiecesInput): Promise<ContentPiece[]> => {
        const { userId, existingContent } = input;

        if (existingContent.length === 0) return [];

        const existingContentItems: DynamoDbPostedContentPiece[] = existingContent.map((piece) => ({
            PK: `u#${userId}#posted`,
            SK: `f#${piece.format}#ec#${uuidv4()}`,
            content: piece.content,
        }));

        const putRequests = existingContentItems.map((item) => ({
            PutRequest: {
                Item: item,
            },
        }));

        const command = new BatchWriteCommand({
            RequestItems: {
                [this.appDataTableName]: putRequests,
            },
        });

        try {
            await this.docClient.send(command);
            return existingContentItems.map((item) => this.mapContentPiece(item));
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to create existing content pieces.");
        }
    };

    updateBrandSummary = async (input: DynamoDbUpdateBrandSummaryInput): Promise<UserProfile> => {
        const { userId, brandSummary } = input;

        const command = new UpdateCommand({
            TableName: this.appDataTableName,
            Key: {
                PK: `u#${userId}`,
                SK: "profile",
            },
            UpdateExpression: "SET brandSummary = :brandSummary",
            ExpressionAttributeValues: {
                ":brandSummary": brandSummary,
            },
            ReturnValues: "ALL_NEW",
        });

        try {
            const response = await this.docClient.send(command);
            const userProfile = DynamoDbUserProfileSchema.parse(response.Attributes);
            return this.mapUserProfile(userProfile);
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to update brand summary.");
        }
    };

    getUserProfile = async (input: DynamoDbGetUserProfileInput): Promise<UserProfile | null> => {
        const { userId } = input;

        const command = new GetCommand({
            TableName: this.appDataTableName,
            Key: {
                PK: `u#${userId}`,
                SK: "profile",
            },
        });

        try {
            const response = await this.docClient.send(command);
            if (!response.Item) return null;
            const userProfile = DynamoDbUserProfileSchema.parse(response.Item);
            return this.mapUserProfile(userProfile);
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to retrieve user profile.");
        }
    };

    createUserAnthropicApiKey = async (input: DynamoDbCreateUserAnthropicApiKeyInput): Promise<UserAnthropicApiKey> => {
        const { userId, encryptedAnthropicApiKey } = input;

        const userAnthropicApiKeyItem: DynamoDbUserAnthropicApiKey = {
            PK: `u#${userId}`,
            SK: "anthropic-api-key",
            apiKey: encryptedAnthropicApiKey,
        };

        const command = new PutCommand({
            TableName: this.appDataTableName,
            Item: userAnthropicApiKeyItem,
        });

        try {
            await this.docClient.send(command);
            return this.mapUserAnthropicApiKey(userAnthropicApiKeyItem);
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to save user Anthropic API key.");
        }
    };

    getUserAnthropicApiKey = async (
        input: DynamoDbGetUserAnthropicApiKeyInput,
    ): Promise<UserAnthropicApiKey | null> => {
        const { userId } = input;

        const command = new GetCommand({
            TableName: this.appDataTableName,
            Key: {
                PK: `u#${userId}`,
                SK: "anthropic-api-key",
            },
        });

        try {
            const response = await this.docClient.send(command);
            if (!response.Item) return null;
            const anthropicApiKey = DynamoDbUserAnthropicApiKeySchema.parse(response.Item);
            return this.mapUserAnthropicApiKey(anthropicApiKey);
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to retrieve user Anthropic API key.");
        }
    };

    createContentRequest = async (input: DynamoDbCreateContentRequestInput): Promise<ContentRequest> => {
        const { userId, conciseIdeaContext } = input;
        const { ideaContext, contentFormat, contentPiecesCount } = input.contentRequest;

        const contentRequestItem: DynamoDbContentRequest = {
            PK: `u#${userId}#cr`,
            SK: `cr#${uuidv4()}`,
            ideaContext,
            contentFormat,
            contentPiecesCount,
            conciseIdeaContext,
            isRequestProcessed: false,
            createdAt: Date.now(),
        };

        const command = new PutCommand({
            TableName: this.appDataTableName,
            Item: contentRequestItem,
        });

        try {
            await this.docClient.send(command);
            return this.mapContentRequest(contentRequestItem);
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to create content request.");
        }
    };

    getAllContentRequests = async (input: DynamoDbGetAllContentRequestsInput): Promise<ContentRequest[]> => {
        const { userId } = input;

        const command = new QueryCommand({
            TableName: this.appDataTableName,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
            ExpressionAttributeValues: {
                ":pk": `u#${userId}#cr`,
                ":skPrefix": "cr#",
            },
        });

        try {
            const response = await this.docClient.send(command);
            if (!response.Items) return [];
            const contentRequests = DynamoDbContentRequestListSchema.parse(response.Items);
            return contentRequests
                .map((cr) => this.mapContentRequest(cr))
                .sort((cr1, cr2) => cr2.createdAt - cr1.createdAt);
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to retrieve content requests.");
        }
    };

    getContentRequest = async (input: DynamoDbGetContentRequestInput): Promise<ContentRequest | null> => {
        const { userId, contentRequestId } = input;

        const command = new GetCommand({
            TableName: this.appDataTableName,
            Key: {
                PK: `u#${userId}#cr`,
                SK: `cr#${contentRequestId}`,
            },
        });

        try {
            const response = await this.docClient.send(command);
            if (!response.Item) return null;
            const contentRequest = DynamoDbContentRequestSchema.parse(response.Item);
            return this.mapContentRequest(contentRequest);
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to retrieve content request.");
        }
    };

    getAllGeneratedContentByRequest = async (
        input: DynamoDbGetAllGeneratedContentByRequestInput,
    ): Promise<GeneratedContentPiece[]> => {
        const { userId, contentRequestId } = input;

        const command = new QueryCommand({
            TableName: this.appDataTableName,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
            ExpressionAttributeValues: {
                ":pk": `u#${userId}#cr#${contentRequestId}#gc`,
                ":skPrefix": "gc#",
            },
        });

        try {
            const response = await this.docClient.send(command);
            if (!response.Items) return [];
            const generatedContent = DynamoDbGeneratedContentPieceListSchema.parse(response.Items);
            return generatedContent.map((gc) => this.mapGeneratedContentPiece(gc));
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to retrieve generated content.");
        }
    };

    getPostedContent = async (input: DynamoDbGetPostedContentInput): Promise<ContentPiece[]> => {
        const { userId } = input;

        const command = new QueryCommand({
            TableName: this.appDataTableName,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: {
                ":pk": `u#${userId}#posted`,
            },
        });

        try {
            const response = await this.docClient.send(command);
            if (!response.Items) return [];
            const postedContent = DynamoDbPostedContentPieceListSchema.parse(response.Items);
            return postedContent.map((pc) => this.mapContentPiece(pc));
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to retrieve posted content.");
        }
    };

    createGeneratedContentPieces = async (
        input: DynamoDbCreateGeneratedContentPiecesInput,
    ): Promise<GeneratedContentPiece[]> => {
        const { userId, contentRequestId, contentFormat, generatedContent } = input;

        const generatedContentItems: DynamoDbGeneratedContentPiece[] = generatedContent.map((piece) => {
            const generatedContentId = `gc#${uuidv4()}`;
            return {
                PK: `u#${userId}#cr#${contentRequestId}#gc`,
                SK: generatedContentId,
                generatedContentId,
                format: contentFormat,
                idea: piece.idea,
                content: piece.content,
                initialLlmContent: piece.content,
                markedAsPosted: false,
            };
        });

        const putRequests = generatedContentItems.map((item) => ({
            PutRequest: {
                Item: item,
            },
        }));

        const command = new BatchWriteCommand({
            RequestItems: {
                [this.appDataTableName]: putRequests,
            },
        });

        try {
            await this.docClient.send(command);
            return generatedContentItems.map((gc) => this.mapGeneratedContentPiece(gc));
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to create existing content pieces.");
        }
    };

    getGeneratedContentPiece = async (
        input: DynamoDbGetGeneratedContentPieceInput,
    ): Promise<GeneratedContentPiece | null> => {
        const { generatedContentId } = input;

        const command = new QueryCommand({
            TableName: this.appDataTableName,
            IndexName: this.generatedContentGsiName,
            KeyConditionExpression: "generatedContentId = :generatedContentId",
            ExpressionAttributeValues: {
                ":generatedContentId": `gc#${generatedContentId}`,
            },
        });

        try {
            const response = await this.docClient.send(command);
            if (!response.Items || response.Items.length === 0) return null;
            const generatedContent = DynamoDbGeneratedContentPieceSchema.parse(response.Items[0]);
            return this.mapGeneratedContentPiece(generatedContent);
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to retrieve generated content piece.");
        }
    };

    updateGeneratedContentPieceContent = async (
        input: DynamoDbUpdateGeneratedContentPieceContentInput,
    ): Promise<GeneratedContentPiece> => {
        const { userId, contentRequestId, generatedContentId, content } = input;

        const command = new UpdateCommand({
            TableName: this.appDataTableName,
            Key: {
                PK: `u#${userId}#cr#${contentRequestId}#gc`,
                SK: `gc#${generatedContentId}`,
            },
            UpdateExpression: "SET content = :content",
            ExpressionAttributeValues: {
                ":content": content,
            },
            ReturnValues: "ALL_NEW",
        });

        try {
            const response = await this.docClient.send(command);
            const generatedContent = DynamoDbGeneratedContentPieceSchema.parse(response.Attributes);
            return this.mapGeneratedContentPiece(generatedContent);
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to update generated content piece.");
        }
    };

    updateIsContentRequestProcessed = async (
        input: DynamoDbUpdateIsContentRequestProcessedInput,
    ): Promise<ContentRequest> => {
        const { userId, contentRequestId, isRequestProcessed } = input;

        const command = new UpdateCommand({
            TableName: this.appDataTableName,
            Key: {
                PK: `u#${userId}#cr`,
                SK: `cr#${contentRequestId}`,
            },
            UpdateExpression: "SET isRequestProcessed = :isRequestProcessed",
            ExpressionAttributeValues: {
                ":isRequestProcessed": isRequestProcessed,
            },
            ReturnValues: "ALL_NEW",
        });

        try {
            const response = await this.docClient.send(command);
            const contentRequest = DynamoDbContentRequestSchema.parse(response.Attributes);
            return this.mapContentRequest(contentRequest);
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to update content request processed status.");
        }
    };

    private mapUserProfile = (profile: DynamoDbUserProfile): UserProfile => {
        return {
            userId: profile.PK.split("#")[1],
            fullName: profile.fullName,
            brandThemes: profile.brandThemes,
            toneOfVoice: profile.toneOfVoice,
            targetAudience: profile.targetAudience,
            contentGoals: profile.contentGoals,
            brandSummary: profile.brandSummary,
        };
    };

    private mapContentPiece = (piece: DynamoDbPostedContentPiece): ContentPiece => {
        return {
            id: piece.SK.split("#")[3],
            format: piece.SK.split("#")[1],
            content: piece.content,
        };
    };

    private mapContentRequest = (cr: DynamoDbContentRequest): ContentRequest => {
        return {
            id: cr.SK.split("#")[1],
            ideaContext: cr.ideaContext,
            contentFormat: cr.contentFormat,
            contentPiecesCount: cr.contentPiecesCount,
            conciseIdeaContext: cr.conciseIdeaContext,
            isRequestProcessed: cr.isRequestProcessed,
            createdAt: cr.createdAt,
        };
    };

    private mapGeneratedContentPiece = (piece: DynamoDbGeneratedContentPiece): GeneratedContentPiece => {
        return {
            id: piece.generatedContentId.split("#")[1],
            format: piece.format,
            content: piece.content,
            idea: piece.idea,
            initialLlmContent: piece.initialLlmContent,
            markedAsPosted: piece.markedAsPosted,
            userId: piece.PK.split("#")[1],
            contentRequestId: piece.PK.split("#")[3],
        };
    };

    private mapUserAnthropicApiKey = (apiKey: DynamoDbUserAnthropicApiKey): UserAnthropicApiKey => {
        return {
            userId: apiKey.PK.split("#")[1],
            encryptedAnthropicApiKey: Buffer.from(apiKey.apiKey),
        };
    };
}
