import { z } from "zod";
import { BrandDetailsDto } from "../../models/dto/BrandDetailsDto";
import { ContentPieceDto } from "../../models/dto/ContentPieceDto";
import { ContentRequestDto } from "../../models/dto/ContentRequestDto";
import { GeneratedContentPieceDto } from "../../models/dto/GeneratedContentPieceDto";

// Function Inputs
export interface DynamoDbCreateUserProfileInput {
    userId: string;
    fullName: string;
    brandDetails: BrandDetailsDto;
}

export interface DynamoDbCreateExistingContentPiecesInput {
    userId: string;
    existingContent: ContentPieceDto[];
}

export interface DynamoDbUpdateBrandSummaryInput {
    userId: string;
    brandSummary: string;
}

export interface DynamoDbGetUserProfileInput {
    userId: string;
}

export interface DynamoDbCreateContentRequestInput {
    userId: string;
    contentRequest: ContentRequestDto;
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
    generatedContent: GeneratedContentPieceDto[];
}

export interface DynamoDbGetGeneratedContentPieceInput {
    generatedContentId: string;
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

export type DynamoDbUserProfile = z.infer<typeof DynamoDbUserProfileSchema>;
export type DynamoDbPostedContentPiece = z.infer<typeof DynamoDbPostedContentPieceSchema>;
export type DynamoDbPostedContentPieceList = z.infer<typeof DynamoDbPostedContentPieceListSchema>;
export type DynamoDbContentRequest = z.infer<typeof DynamoDbContentRequestSchema>;
export type DynamoDbContentRequestList = z.infer<typeof DynamoDbContentRequestListSchema>;
export type DynamoDbGeneratedContentPiece = z.infer<typeof DynamoDbGeneratedContentPieceSchema>;
export type DynamoDbGeneratedContentPieceList = z.infer<typeof DynamoDbGeneratedContentPieceListSchema>;
