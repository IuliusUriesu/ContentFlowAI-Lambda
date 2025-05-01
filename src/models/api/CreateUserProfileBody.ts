import { z } from "zod";
import { BrandDetailsCreateDtoSchema } from "../dto/BrandDetailsCreateDto";
import { ContentPieceCreateDtoSchema } from "../dto/ContentPieceCreateDto";

const existingContentError = "Required field 'existingContent' is missing or invalid.";

export const CreateUserProfileBodySchema = z.object({
    brandDetails: BrandDetailsCreateDtoSchema,
    existingContent: z.array(ContentPieceCreateDtoSchema, {
        required_error: existingContentError,
        invalid_type_error: existingContentError,
    }),
});

export type CreateUserProfileBody = z.infer<typeof CreateUserProfileBodySchema>;
