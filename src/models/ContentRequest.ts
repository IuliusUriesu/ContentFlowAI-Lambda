import { z } from "zod";

export const ContentRequestSchema = z.object({
    ideaContext: z.string(),
    contentFormat: z.string(),
    contentPiecesCount: z.number(),
});

export type ContentRequest = z.infer<typeof ContentRequestSchema>;
