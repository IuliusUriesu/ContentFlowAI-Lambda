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
    DynamoDbCreateContentRequestInput,
    DynamoDbCreateExistingContentPiecesInput,
    DynamoDbCreateGeneratedContentPiecesInput,
    DynamoDbCreateUserProfileInput,
    DynamoDbGetContentRequestInput,
    DynamoDbGetPostedContent,
    DynamoDbGetUserProfileInput,
    DynamoDbUpdateBrandSummaryInput,
    DynamoDbUpdateIsContentRequestProcessedInput,
} from "./types";

class DynamoDbService {
    private docClient: DynamoDBDocumentClient;
    private appDataTableName: string;

    constructor() {
        const awsRegion = getEnvVariable("AWS_REGION");
        const client = new DynamoDBClient({ region: awsRegion });
        this.docClient = DynamoDBDocumentClient.from(client);
        this.appDataTableName = getEnvVariable("APP_DATA_TABLE_NAME");
    }

    createUserProfile = async (input: DynamoDbCreateUserProfileInput) => {
        const { userId, fullName } = input;
        const { brandThemes, toneOfVoice, targetAudience, contentGoals } = input.brandDetails;

        const userProfileItem = {
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
            return userProfileItem;
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to create user profile.");
        }
    };

    createExistingContentPieces = async (input: DynamoDbCreateExistingContentPiecesInput) => {
        const { userId, existingContent } = input;

        if (existingContent.length === 0) return [];

        const existingContentItems = existingContent.map((piece) => ({
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
            return existingContentItems;
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to create existing content pieces.");
        }
    };

    updateBrandSummary = async (input: DynamoDbUpdateBrandSummaryInput) => {
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
            ReturnValues: "UPDATED_NEW",
        });

        try {
            const response = await this.docClient.send(command);
            return response.Attributes;
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to update brand summary.");
        }
    };

    getUserProfile = async (input: DynamoDbGetUserProfileInput) => {
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
            return response.Item;
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to retrieve user profile.");
        }
    };

    createContentRequest = async (input: DynamoDbCreateContentRequestInput) => {
        const { userId, conciseIdeaContext } = input;
        const { ideaContext, contentFormat, contentPiecesCount } = input.contentRequest;

        const contentRequestItem = {
            PK: `u#${userId}`,
            SK: `cr#${Date.now()}#${uuidv4()}`,
            ideaContext,
            contentFormat,
            contentPiecesCount,
            conciseIdeaContext,
            isRequestProcessed: false,
        };

        const command = new PutCommand({
            TableName: this.appDataTableName,
            Item: contentRequestItem,
        });

        try {
            await this.docClient.send(command);
            return contentRequestItem;
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to create content request.");
        }
    };

    getContentRequest = async (input: DynamoDbGetContentRequestInput) => {
        const { userId, contentRequestFullId } = input;

        const command = new GetCommand({
            TableName: this.appDataTableName,
            Key: {
                PK: `u#${userId}`,
                SK: contentRequestFullId,
            },
        });

        try {
            const response = await this.docClient.send(command);
            return response.Item;
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to retrieve content request.");
        }
    };

    getPostedContent = async (input: DynamoDbGetPostedContent) => {
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
            return response.Items;
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to retrieve posted content.");
        }
    };

    createGeneratedContentPieces = async (input: DynamoDbCreateGeneratedContentPiecesInput) => {
        const { userId, contentRequestFullId, contentFormat, generatedContent } = input;

        const generatedContentItems = generatedContent.map((piece) => {
            const generatedContentId = `gc#${uuidv4()}`;
            return {
                PK: contentRequestFullId,
                SK: generatedContentId,
                userId: `u#${userId}`,
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
            return generatedContentItems;
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to create existing content pieces.");
        }
    };

    updateIsContentRequestProcessed = async (input: DynamoDbUpdateIsContentRequestProcessedInput) => {
        const { userId, contentRequestFullId, isRequestProcessed } = input;

        const command = new UpdateCommand({
            TableName: this.appDataTableName,
            Key: {
                PK: `u#${userId}`,
                SK: contentRequestFullId,
            },
            UpdateExpression: "SET isRequestProcessed = :isRequestProcessed",
            ExpressionAttributeValues: {
                ":isRequestProcessed": isRequestProcessed,
            },
            ReturnValues: "ALL_NEW",
        });

        try {
            const response = await this.docClient.send(command);
            return response.Attributes;
        } catch (error) {
            console.log(error);
            throw new DynamoDbError("Failed to update content request processed status.");
        }
    };
}

export default DynamoDbService;
