import { BrandDetails, ExistingContentPiece } from "../../utils/utils";

export interface DynamoDbCreateUserProfileInput {
    userId: string;
    fullName: string;
    brandDetails: BrandDetails;
}

export interface DynamoDbCreateExistingContentPiecesInput {
    userId: string;
    existingContent: ExistingContentPiece[];
}
