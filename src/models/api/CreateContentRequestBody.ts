import { z } from "zod";
import { ContentRequestDtoSchema } from "../dto/ContentRequestDto";

export const CreateContentRequestBodySchema = ContentRequestDtoSchema;

export type CreateContentRequestBody = z.infer<typeof CreateContentRequestBodySchema>;
