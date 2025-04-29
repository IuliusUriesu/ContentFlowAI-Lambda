import { z } from "zod";

const brandThemesError = "Required field 'brandThemes' is missing or invalid.";
const toneOfVoiceError = "Required field 'toneOfVoice' is missing or invalid.";
const targetAudienceError = "Required field 'targetAudience' is missing or invalid.";
const contentGoalsError = "Required field 'contentGoals' is missing or invalid.";

export const BrandDetailsDtoSchema = z.object({
    brandThemes: z.string({ required_error: brandThemesError, invalid_type_error: brandThemesError }),
    toneOfVoice: z.string({ required_error: toneOfVoiceError, invalid_type_error: toneOfVoiceError }),
    targetAudience: z.string({ required_error: targetAudienceError, invalid_type_error: targetAudienceError }),
    contentGoals: z.string({ required_error: contentGoalsError, invalid_type_error: contentGoalsError }),
});

export type BrandDetailsDto = z.infer<typeof BrandDetailsDtoSchema>;
