import { z } from "zod";
import { ContentPieceSchema } from "./ContentPiece";

export const GeneratedContentPieceSchema = ContentPieceSchema.extend({
    idea: z.string(),
    initialLlmContent: z.string(),
    markedAsPosted: z.boolean(),
});

export type GeneratedContentPiece = z.infer<typeof GeneratedContentPieceSchema>;
