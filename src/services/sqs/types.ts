import { z } from "zod";
import { BrandDetailsSchema } from "../../models/BrandDetails";
import { ExistingContentPieceSchema } from "../../models/ExistingContentPiece";

export interface SqsSendUserProfileMessageInput {
    message: SqsUserProfileMessage;
}

export const SqsUserProfileMessageSchema = z.object({
    brandDetails: BrandDetailsSchema,
    existingContent: z.array(ExistingContentPieceSchema),
});

export type SqsUserProfileMessage = z.infer<typeof SqsUserProfileMessageSchema>;
