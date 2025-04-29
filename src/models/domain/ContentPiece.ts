import { z } from "zod";

export const ContentPieceSchema = z.object({
    id: z.string(),
    format: z.string(),
    content: z.string(),
});

export type ContentPiece = z.infer<typeof ContentPieceSchema>;
