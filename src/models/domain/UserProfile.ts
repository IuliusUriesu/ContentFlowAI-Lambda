import { z } from "zod";

export const UserProfileSchema = z.object({
    userId: z.string(),
    fullName: z.string(),
    brandThemes: z.string(),
    toneOfVoice: z.string(),
    targetAudience: z.string(),
    contentGoals: z.string(),
    brandSummary: z.string().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
