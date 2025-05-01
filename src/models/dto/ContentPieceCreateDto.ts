import { z } from "zod";

const error = "A content piece must have two fields: 'format' and 'content'.";

export const ContentPieceCreateDtoSchema = z.object({
    format: z.string({ required_error: error, invalid_type_error: error }),
    content: z.string({ required_error: error, invalid_type_error: error }),
});

export type ContentPieceCreateDto = z.infer<typeof ContentPieceCreateDtoSchema>;
