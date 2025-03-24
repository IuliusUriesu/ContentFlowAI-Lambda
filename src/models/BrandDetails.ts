import { z } from "zod";

export const BrandDetailsSchema = z.object({
    brandThemes: z.string(),
    toneOfVoice: z.string(),
    targetAudience: z.string(),
    contentGoals: z.string(),
});

export type BrandDetails = z.infer<typeof BrandDetailsSchema>;
