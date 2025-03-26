import { BrandDetails } from "../../models/BrandDetails";
import { ExistingContentPiece } from "../../models/ExistingContentPiece";

export interface DynamoDbCreateUserProfileInput {
    userId: string;
    fullName: string;
    brandDetails: BrandDetails;
}

export interface DynamoDbCreateExistingContentPiecesInput {
    userId: string;
    existingContent: ExistingContentPiece[];
}

export interface DynamoDbUpdateBrandSummaryInput {
    userId: string;
    brandSummary: string;
}

export interface DynamoDbGetUserProfileInput {
    userId: string;
}
