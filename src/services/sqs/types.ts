import { z } from "zod";
import { BrandDetailsSchema } from "../../models/BrandDetails";
import { ExistingContentPieceSchema } from "../../models/ExistingContentPiece";

export interface SqsSendBrandSummaryRequestMessageInput {
    message: SqsBrandSummaryRequestMessage;
    queueUrl: string;
}

export const SqsBrandSummaryRequestMessageSchema = z.object({
    userId: z.string(),
    brandDetails: BrandDetailsSchema,
    existingContent: z.array(ExistingContentPieceSchema),
});

export type SqsBrandSummaryRequestMessage = z.infer<typeof SqsBrandSummaryRequestMessageSchema>;
