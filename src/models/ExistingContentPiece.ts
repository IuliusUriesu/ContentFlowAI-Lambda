import { z } from "zod";

export const ExistingContentPieceSchema = z.object({
    format: z.string(),
    content: z.string(),
});

export type ExistingContentPiece = z.infer<typeof ExistingContentPieceSchema>;
