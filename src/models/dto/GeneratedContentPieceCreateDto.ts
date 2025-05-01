import { z } from "zod";

export const GeneratedContentPieceCreateDtoSchema = z.object({
    idea: z.string(),
    content: z.string(),
});

export type GeneratedContentPieceCreateDto = z.infer<typeof GeneratedContentPieceCreateDtoSchema>;
