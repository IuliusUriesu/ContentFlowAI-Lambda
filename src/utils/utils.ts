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

export const getEnvVariable = (variableName: string): string => {
    if (!process.env[variableName]) {
        throw new DevelopmentError(`Missing environment variable ${variableName}.`);
    }
    return process.env[variableName];
};

export class DevelopmentError extends Error {}
export class BadRequestError extends Error {}
export class DynamoDbError extends Error {}
