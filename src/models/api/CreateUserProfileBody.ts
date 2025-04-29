import { z } from "zod";
import { BrandDetailsDtoSchema } from "../dto/BrandDetailsDto";
import { ContentPieceDtoSchema } from "../dto/ContentPieceDto";

const existingContentError = "Required field 'existingContent' is missing or invalid.";

export const CreateUserProfileBodySchema = z.object({
    brandDetails: BrandDetailsDtoSchema,
    existingContent: z.array(ContentPieceDtoSchema, {
        required_error: existingContentError,
        invalid_type_error: existingContentError,
    }),
});

export type CreateUserProfileBody = z.infer<typeof CreateUserProfileBodySchema>;
