import { z } from "zod";
import { BrandDetailsCreateDtoSchema } from "../dto/BrandDetailsCreateDto";
import { ContentPieceCreateDtoSchema } from "../dto/ContentPieceCreateDto";

const existingContentError = "Required field 'existingContent' is missing or invalid.";
const anthropicApiKeyError = "Required field 'anthropicApiKey' is missing or invalid.";

export const CreateUserProfileBodySchema = z.object({
    brandDetails: BrandDetailsCreateDtoSchema,
    existingContent: z.array(ContentPieceCreateDtoSchema, {
        required_error: existingContentError,
        invalid_type_error: existingContentError,
    }),
    anthropicApiKey: z.string({ required_error: anthropicApiKeyError, invalid_type_error: anthropicApiKeyError }),
});

export type CreateUserProfileBody = z.infer<typeof CreateUserProfileBodySchema>;
