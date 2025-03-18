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
        throw new MissingEnvironmentVariableError("Missing environment variable APP_DATA_TABLE_NAME.");
    }
    return process.env.APP_DATA_TABLE_NAME;
};

export class MissingEnvironmentVariableError extends Error {}
export class BadRequestError extends Error {}
