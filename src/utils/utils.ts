export const getEnvVariable = (variableName: string): string => {
    if (!process.env[variableName]) {
        throw new DevelopmentError(`Missing environment variable ${variableName}.`);
    }
    return process.env[variableName];
};

export class DevelopmentError extends Error {}
export class BadRequestError extends Error {}
export class DynamoDbError extends Error {}
export class SqsError extends Error {}
export class LlmResponseParsingError extends Error {}
