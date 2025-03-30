import { z } from "zod";
import { BrandDetailsSchema } from "../../models/BrandDetails";
import { ContentPieceSchema } from "../../models/ContentPiece";
import { ContentRequestSchema } from "../../models/ContentRequest";

export interface SqsSendBrandSummaryRequestMessageInput {
    message: SqsBrandSummaryRequestMessage;
    queueUrl: string;
}

export const SqsBrandSummaryRequestMessageSchema = z.object({
    userId: z.string(),
    brandDetails: BrandDetailsSchema,
    existingContent: z.array(ContentPieceSchema),
});

export type SqsBrandSummaryRequestMessage = z.infer<typeof SqsBrandSummaryRequestMessageSchema>;

export interface SqsSendContentRequestMessageInput {
    message: SqsContentRequestMessage;
    queueUrl: string;
}

export const SqsContentRequestMessageSchema = z.object({
    userId: z.string(),
    contentRequestFullId: z.string(),
    contentRequest: ContentRequestSchema,
});

export type SqsContentRequestMessage = z.infer<typeof SqsContentRequestMessageSchema>;

export interface SqsSendMessageInput {
    message: string;
    queueUrl: string;
}
