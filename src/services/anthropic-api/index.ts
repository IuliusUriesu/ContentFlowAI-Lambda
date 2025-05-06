import { AnthropicApiError } from "../../utils/utils";
import AwsEncryptionSdkServiceProvider from "../aws-encryption-sdk";
import DynamoDbServiceProvider from "../dynamodb";
import { AnthropicApiService } from "./AnthropicApiService";

export default class AnthropicApiServiceProvider {
    static async fromUserId(userId: string): Promise<AnthropicApiService> {
        const dynamoDbService = DynamoDbServiceProvider.getService();
        const awsEncryptionSdkService = AwsEncryptionSdkServiceProvider.getService();

        const apiKey = await dynamoDbService.getUserAnthropicApiKey({ userId });
        if (!apiKey) {
            throw new Error("Failed to create AnthropicApiService instance: user API key not found.");
        }

        const decryptedApiKey = await awsEncryptionSdkService.decryptUserAnthropicApiKey(
            apiKey.encryptedAnthropicApiKey,
        );
        return new AnthropicApiService(decryptedApiKey);
    }

    static async fromApiKey(apiKey: string): Promise<AnthropicApiService> {
        return new AnthropicApiService(apiKey);
    }
}
