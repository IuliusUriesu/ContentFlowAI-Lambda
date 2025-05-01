import { z } from "zod";

const ideaContextError = "Required field 'ideaContext' is missing or invalid.";
const contentFormatError = "Required field 'contentFormat' is missing or invalid.";
const contentPiecesCountError = "Required field 'contentPiecesCount' is missing or invalid.";

export const ContentRequestCreateDtoSchema = z.object({
    ideaContext: z.string({ required_error: ideaContextError, invalid_type_error: ideaContextError }),
    contentFormat: z.string({ required_error: contentFormatError, invalid_type_error: contentFormatError }),
    contentPiecesCount: z
        .number({ required_error: contentPiecesCountError, invalid_type_error: contentPiecesCountError })
        .int({ message: contentPiecesCountError })
        .min(1, { message: contentPiecesCountError })
        .max(20, { message: "You can request at most 20 content pieces." }),
});

export type ContentRequestCreateDto = z.infer<typeof ContentRequestCreateDtoSchema>;
