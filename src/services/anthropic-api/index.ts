import { AnthropicApiError } from "../../utils/utils";
import AwsEncryptionSdkServiceProvider from "../aws-encryption-sdk";
import DynamoDbServiceProvider from "../dynamodb";
import { AnthropicApiService } from "./AnthropicApiService";

export default async function createAnthropicApiService(userId: string): Promise<AnthropicApiService> {
    const dynamoDbService = DynamoDbServiceProvider.getService();
    const awsEncryptionSdkService = AwsEncryptionSdkServiceProvider.getService();

    const apiKey = await dynamoDbService.getUserAnthropicApiKey({ userId });
    if (!apiKey) {
        throw new AnthropicApiError("Failed to create AnthropicApiService instance: user API key not found.");
    }

    const decryptedApiKey = await awsEncryptionSdkService.decryptUserAnthropicApiKey(apiKey.encryptedAnthropicApiKey);
    return new AnthropicApiService(decryptedApiKey);
}
