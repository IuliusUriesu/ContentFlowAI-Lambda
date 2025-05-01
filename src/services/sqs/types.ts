import { z } from "zod";
import { BrandDetailsCreateDtoSchema } from "../../models/dto/BrandDetailsCreateDto";
import { ContentPieceCreateDtoSchema } from "../../models/dto/ContentPieceCreateDto";
import { ContentRequestCreateDtoSchema } from "../../models/dto/ContentRequestCreateDto";

export interface SqsSendMessageInput<T> {
    message: T;
    queueUrl: string;
}

export const SqsBrandSummaryRequestMessageSchema = z.object({
    userId: z.string(),
    brandDetails: BrandDetailsCreateDtoSchema,
    existingContent: z.array(ContentPieceCreateDtoSchema),
});

export const SqsContentRequestMessageSchema = z.object({
    userId: z.string(),
    contentRequestId: z.string(),
    contentRequest: ContentRequestCreateDtoSchema,
});

export type SqsBrandSummaryRequestMessage = z.infer<typeof SqsBrandSummaryRequestMessageSchema>;
export type SqsContentRequestMessage = z.infer<typeof SqsContentRequestMessageSchema>;
