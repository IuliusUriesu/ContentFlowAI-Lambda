import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ExistingContentPiece, getAppDataTableNameEnvVariable } from "../utils/utils";
import { v4 as uuidv4 } from "uuid";

class DynamoDbService {
    private docClient: DynamoDBDocumentClient;
    private appDataTableName: string;

    constructor() {
        const client = new DynamoDBClient({});
        this.docClient = DynamoDBDocumentClient.from(client);

        this.appDataTableName = getAppDataTableNameEnvVariable();
    }

    createUserProfile = async (
        userId: string,
        fullName: string,
        brandThemes: string,
        toneOfVoice: string,
        targetAudience: string,
        contentGoals: string,
    ) => {
        const command = new PutCommand({
            TableName: this.appDataTableName,
            Item: {
                PK: `u#${userId}`,
                SK: "profile",
                fullName,
                brandThemes,
                toneOfVoice,
                targetAudience,
                contentGoals,
            },
        });

        const response = await this.docClient.send(command);
        return response;
    };

    createExistingContentPieces = async (userId: string, existingContent: ExistingContentPiece[]) => {
        if (existingContent.length === 0) return;

        const putRequests = existingContent.map((piece) => ({
            PutRequest: {
                Item: {
                    PK: `u#${userId}#posted`,
                    SK: `f#${piece.format}#ec#${uuidv4()}`,
                    content: piece.content,
                },
            },
        }));

        const command = new BatchWriteCommand({
            RequestItems: {
                [this.appDataTableName]: putRequests,
            },
        });

        const response = await this.docClient.send(command);
        return response;
    };
}

export default DynamoDbService;
