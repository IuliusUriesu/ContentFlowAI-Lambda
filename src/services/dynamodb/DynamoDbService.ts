import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDbError, getEnvVariable } from "../../utils/utils";
import { v4 as uuidv4 } from "uuid";
import { DynamoDbCreateExistingContentPiecesInput, DynamoDbCreateUserProfileInput } from "./interfaces";

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
        const { userId, fullName, brandThemes, toneOfVoice, targetAudience, contentGoals } = input;

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

        if (existingContent.length === 0) return;

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
            throw new DynamoDbError("Failed to create existing content pieces");
        }
    };
}

export default DynamoDbService;
