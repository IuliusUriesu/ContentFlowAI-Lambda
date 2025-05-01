import { z } from "zod";

const contentError = "Required field 'content' is missing or invalid.";

export const EditGeneratedContentPieceBodySchema = z.object({
    content: z.string({ required_error: contentError, invalid_type_error: contentError }),
});

export type EditGeneratedContentPieceBody = z.infer<typeof EditGeneratedContentPieceBodySchema>;
