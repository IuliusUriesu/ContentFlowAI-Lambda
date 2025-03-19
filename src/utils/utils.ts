import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { APIGatewayProxyResult } from "aws-lambda";

export const successResponse = (statusCode: number, body: any): APIGatewayProxyResult => {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    };
};

export const errorResponse = (statusCode: number, errorMessage: string): APIGatewayProxyResult => {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            errorMessage,
        }),
    };
};

export const getAppDataTableName = (): string => {
    if (!process.env.APP_DATA_TABLE_NAME) {
        throw new DevelopmentError("Missing environment variable APP_DATA_TABLE_NAME.");
    }
    return process.env.APP_DATA_TABLE_NAME;
};

const getAnthropicApiKeySecretName = (): string => {
    if (!process.env.ANTHROPIC_API_KEY_SECRET_NAME) {
        throw new DevelopmentError("Missing environment variable ANTHROPIC_API_KEY_SECRET_NAME.");
    }
    return process.env.ANTHROPIC_API_KEY_SECRET_NAME;
};

export const getAnthropicApiKey = async (): Promise<string> => {
    const client = new SecretsManagerClient();
    const secretName = getAnthropicApiKeySecretName();
    const command = new GetSecretValueCommand({
        SecretId: secretName,
    });

    const response = await client.send(command);
    const secretJson = response.SecretString;
    if (!secretJson) {
        throw new DevelopmentError("Missing or invalid Anthropic API Key secret.");
    }

    const secretObject = JSON.parse(secretJson);
    if (!secretObject.ANTHROPIC_API_KEY || typeof secretObject.ANTHROPIC_API_KEY !== "string") {
        throw new DevelopmentError("Missing or invalid secret key ANTHROPIC_API_KEY.");
    }
    return secretObject.ANTHROPIC_API_KEY;
};

export class DevelopmentError extends Error {}
export class BadRequestError extends Error {}
