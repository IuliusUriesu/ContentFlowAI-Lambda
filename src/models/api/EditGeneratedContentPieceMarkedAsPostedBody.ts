import { z } from "zod";

const markedAsPostedError = "Required field 'markedAsPosted' is missing or invalid.";

export const EditGeneratedContentPieceMarkedAsPostedBodySchema = z.object({
    markedAsPosted: z.boolean({ required_error: markedAsPostedError, invalid_type_error: markedAsPostedError }),
});

export type EditGeneratedContentPieceMarkedAsPostedBody = z.infer<
    typeof EditGeneratedContentPieceMarkedAsPostedBodySchema
>;
