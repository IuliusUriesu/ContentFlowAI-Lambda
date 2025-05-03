import { z } from "zod";

export const UserAnthropicApiKeySchema = z.object({
    userId: z.string(),
    encryptedAnthropicApiKey: z.instanceof(Buffer),
});

export type UserAnthropicApiKey = z.infer<typeof UserAnthropicApiKeySchema>;
