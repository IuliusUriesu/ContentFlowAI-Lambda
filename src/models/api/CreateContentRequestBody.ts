import { z } from "zod";
import { ContentRequestCreateDtoSchema } from "../dto/ContentRequestCreateDto";

export const CreateContentRequestBodySchema = ContentRequestCreateDtoSchema;

export type CreateContentRequestBody = z.infer<typeof CreateContentRequestBodySchema>;
