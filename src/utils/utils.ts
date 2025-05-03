export const getEnvVariable = (variableName: string): string => {
    if (!process.env[variableName]) {
        throw new DevelopmentError(`Missing environment variable ${variableName}.`);
    }
    return process.env[variableName];
};

export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export class DevelopmentError extends Error {}
export class BadRequestError extends Error {}
export class DynamoDbError extends Error {}
export class SqsError extends Error {}
export class AwsEncryptionSdkError extends Error {}
export class LlmResponseParsingError extends Error {}
