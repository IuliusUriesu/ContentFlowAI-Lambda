import { z } from "zod";

export const GeneratedContentPieceDtoSchema = z.object({
    idea: z.string(),
    content: z.string(),
});

export type GeneratedContentPieceDto = z.infer<typeof GeneratedContentPieceDtoSchema>;
