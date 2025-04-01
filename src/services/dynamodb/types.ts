import { BrandDetails } from "../../models/BrandDetails";
import { ContentRequest } from "../../models/ContentRequest";
import { ContentPiece } from "../../models/ContentPiece";
import { GeneratedContentPiece } from "../../models/GeneratedContentPiece";

export interface DynamoDbCreateUserProfileInput {
    userId: string;
    fullName: string;
    brandDetails: BrandDetails;
}

export interface DynamoDbCreateExistingContentPiecesInput {
    userId: string;
    existingContent: ContentPiece[];
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
    contentRequest: ContentRequest;
    conciseIdeaContext: string;
}

export interface DynamoDbGetAllContentRequestsInput {
    userId: string;
}

export interface DynamoDbGetContentRequestInput {
    userId: string;
    contentRequestFullId: string;
}

export interface DynamoDbGetAllGeneratedContentByRequestInput {
    userId: string;
    contentRequestFullId: string;
}

export interface DynamoDbGetPostedContentInput {
    userId: string;
}

export interface DynamoDbCreateGeneratedContentPiecesInput {
    userId: string;
    contentRequestFullId: string;
    contentFormat: string;
    generatedContent: GeneratedContentPiece[];
}

export interface DynamoDbGetGeneratedContentPieceInput {
    generatedContentFullId: string;
}

export interface DynamoDbUpdateIsContentRequestProcessedInput {
    userId: string;
    contentRequestFullId: string;
    isRequestProcessed: boolean;
}
