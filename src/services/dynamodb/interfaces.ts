export interface DynamoDbCreateUserProfileInput {
    userId: string;
    fullName: string;
    brandThemes: string;
    toneOfVoice: string;
    targetAudience: string;
    contentGoals: string;
}

export interface DynamoDbCreateExistingContentPiecesInput {
    userId: string;
    existingContent: ExistingContentPiece[];
}

export interface ExistingContentPiece {
    format: string;
    content: string;
}
