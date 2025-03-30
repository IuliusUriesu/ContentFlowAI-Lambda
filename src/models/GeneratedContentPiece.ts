import { z } from "zod";

export const GeneratedContentPieceSchema = z.object({
    idea: z.string(),
    content: z.string(),
});

export type GeneratedContentPiece = z.infer<typeof GeneratedContentPieceSchema>;
