import { z } from "zod";
import { BrandDetailsDtoSchema } from "../../models/dto/BrandDetailsDto";
import { ContentPieceDtoSchema } from "../../models/dto/ContentPieceDto";
import { ContentRequestDtoSchema } from "../../models/dto/ContentRequestDto";

export interface SqsSendMessageInput<T> {
    message: T;
    queueUrl: string;
}

export const SqsBrandSummaryRequestMessageSchema = z.object({
    userId: z.string(),
    brandDetails: BrandDetailsDtoSchema,
    existingContent: z.array(ContentPieceDtoSchema),
});

export const SqsContentRequestMessageSchema = z.object({
    userId: z.string(),
    contentRequestId: z.string(),
    contentRequest: ContentRequestDtoSchema,
});

export type SqsBrandSummaryRequestMessage = z.infer<typeof SqsBrandSummaryRequestMessageSchema>;
export type SqsContentRequestMessage = z.infer<typeof SqsContentRequestMessageSchema>;
