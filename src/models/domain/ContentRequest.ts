import { z } from "zod";

export const ContentRequestSchema = z.object({
    id: z.string(),
    ideaContext: z.string(),
    contentFormat: z.string(),
    contentPiecesCount: z.number().min(1),
    conciseIdeaContext: z.string(),
    isRequestProcessed: z.boolean(),
    createdAt: z.number(),
});

export type ContentRequest = z.infer<typeof ContentRequestSchema>;
