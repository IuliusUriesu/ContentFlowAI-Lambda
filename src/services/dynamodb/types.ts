import { z } from "zod";
import { BrandDetailsCreateDto } from "../../models/dto/BrandDetailsCreateDto";
import { ContentPieceCreateDto } from "../../models/dto/ContentPieceCreateDto";
import { ContentRequestCreateDto } from "../../models/dto/ContentRequestCreateDto";
import { GeneratedContentPieceCreateDto } from "../../models/dto/GeneratedContentPieceCreateDto";

// Function Inputs
export interface DynamoDbCreateUserProfileInput {
    userId: string;
    fullName: string;
    brandDetails: BrandDetailsCreateDto;
}

export interface DynamoDbCreateExistingContentPiecesInput {
    userId: string;
    existingContent: ContentPieceCreateDto[];
}

export interface DynamoDbUpdateBrandSummaryInput {
    userId: string;
    brandSummary: string;
}

export interface DynamoDbGetUserProfileInput {
    userId: string;
}

export interface DynamoDbCreateUserAnthropicApiKeyInput {
    userId: string;
    encryptedAnthropicApiKey: Buffer;
}

export interface DynamoDbGetUserAnthropicApiKeyInput {
    userId: string;
}

export interface DynamoDbCreateContentRequestInput {
    userId: string;
    contentRequest: ContentRequestCreateDto;
    conciseIdeaContext: string;
}

export interface DynamoDbGetAllContentRequestsInput {
    userId: string;
}

export interface DynamoDbGetContentRequestInput {
    userId: string;
    contentRequestId: string;
}

export interface DynamoDbGetAllGeneratedContentByRequestInput {
    userId: string;
    contentRequestId: string;
}

export interface DynamoDbGetPostedContentInput {
    userId: string;
}

export interface DynamoDbCreateGeneratedContentPiecesInput {
    userId: string;
    contentRequestId: string;
    contentFormat: string;
    generatedContent: GeneratedContentPieceCreateDto[];
}

export interface DynamoDbGetGeneratedContentPieceInput {
    generatedContentId: string;
}

export interface DynamoDbUpdateGeneratedContentPieceContentInput {
    userId: string;
    contentRequestId: string;
    generatedContentId: string;
    content: string;
}

export interface DynamoDbUpdateIsContentRequestProcessedInput {
    userId: string;
    contentRequestId: string;
    isRequestProcessed: boolean;
}

// Data Model
export const DynamoDbUserProfileSchema = z.object({
    PK: z.string().startsWith("u#"),
    SK: z.literal("profile"),
    fullName: z.string(),
    brandThemes: z.string(),
    toneOfVoice: z.string(),
    targetAudience: z.string(),
    contentGoals: z.string(),
    brandSummary: z.string().optional(),
});

export const DynamoDbPostedContentPieceSchema = z.object({
    PK: z.string().startsWith("u#").endsWith("#posted"),
    SK: z.string().startsWith("f#"),
    content: z.string(),
});

export const DynamoDbPostedContentPieceListSchema = z.array(DynamoDbPostedContentPieceSchema);

export const DynamoDbContentRequestSchema = z.object({
    PK: z.string().startsWith("u#").endsWith("#cr"),
    SK: z.string().startsWith("cr#"),
    ideaContext: z.string(),
    contentFormat: z.string(),
    contentPiecesCount: z.number().int(),
    conciseIdeaContext: z.string(),
    isRequestProcessed: z.boolean(),
    createdAt: z.number(),
});

export const DynamoDbContentRequestListSchema = z.array(DynamoDbContentRequestSchema);

export const DynamoDbGeneratedContentPieceSchema = z
    .object({
        PK: z.string().startsWith("u#").includes("#cr#").endsWith("#gc"),
        SK: z.string().startsWith("gc#"),
        generatedContentId: z.string(),
        format: z.string(),
        idea: z.string(),
        content: z.string(),
        initialLlmContent: z.string(),
        markedAsPosted: z.boolean(),
    })
    .refine((obj) => obj.SK === obj.generatedContentId);

export const DynamoDbGeneratedContentPieceListSchema = z.array(DynamoDbGeneratedContentPieceSchema);

export const DynamoDbUserAnthropicApiKeySchema = z.object({
    PK: z.string().startsWith("u#"),
    SK: z.literal("anthropic-api-key"),
    apiKey: z.instanceof(Uint8Array),
});

export type DynamoDbUserProfile = z.infer<typeof DynamoDbUserProfileSchema>;
export type DynamoDbPostedContentPiece = z.infer<typeof DynamoDbPostedContentPieceSchema>;
export type DynamoDbPostedContentPieceList = z.infer<typeof DynamoDbPostedContentPieceListSchema>;
export type DynamoDbContentRequest = z.infer<typeof DynamoDbContentRequestSchema>;
export type DynamoDbContentRequestList = z.infer<typeof DynamoDbContentRequestListSchema>;
export type DynamoDbGeneratedContentPiece = z.infer<typeof DynamoDbGeneratedContentPieceSchema>;
export type DynamoDbGeneratedContentPieceList = z.infer<typeof DynamoDbGeneratedContentPieceListSchema>;
export type DynamoDbUserAnthropicApiKey = z.infer<typeof DynamoDbUserAnthropicApiKeySchema>;
