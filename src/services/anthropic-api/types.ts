import { z } from "zod";

export interface AnthropicApiGetClaudeResponseInput {
    prompt: string;
    thinking?: boolean;
}

export const AnthropicApiErrorResponseSchema = z.object({
    type: z.literal("error"),
    error: z.object({
        type: z.string(),
        message: z.string(),
    }),
});

export type AnthropicApiErrorResponse = z.infer<typeof AnthropicApiErrorResponseSchema>;
