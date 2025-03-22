import { BrandDetails, ExistingContentPiece } from "../../utils/utils";

export interface SqsSendUserProfileMessageInput {
    message: SqsUserProfileMessage;
}

export interface SqsUserProfileMessage {
    brandDetails: BrandDetails;
    existingContent: ExistingContentPiece[];
}
