import Anthropic from "@anthropic-ai/sdk";
import { AnthropicApiErrorResponseSchema, AnthropicApiGetClaudeResponseInput } from "./types";
import { AnthropicApiError } from "../../utils/utils";

export class AnthropicApiService {
    private anthropic: Anthropic;

    constructor(apiKey: string) {
        this.anthropic = new Anthropic({ apiKey });
    }

    getClaudeResponse = async (input: AnthropicApiGetClaudeResponseInput): Promise<string> => {
        const { prompt, thinking } = input;

        try {
            const response = await this.anthropic.messages.create({
                model: "claude-3-7-sonnet-20250219",
                max_tokens: 20000,
                thinking: thinking === true ? { type: "enabled", budget_tokens: 12000 } : undefined,
                messages: [{ role: "user", content: prompt }],
            });

            const textMessage = response.content.filter((content) => content.type === "text");
            return textMessage[0].text;
        } catch (error) {
            this.handleApiError(error);
            throw new AnthropicApiError("Unable to talk with Claude.");
        }
    };

    private handleApiError = (error: unknown) => {
        if (error instanceof Anthropic.APIError) {
            const errorResponse = AnthropicApiErrorResponseSchema.safeParse(error.error);
            if (errorResponse.success) {
                const errorObj = errorResponse.data.error;
                if (errorObj.type === "authentication_error") throw new AnthropicApiError("Invalid API key.", 401);
                const status = typeof error.status === "number" ? error.status : undefined;
                throw new AnthropicApiError(errorObj.message, status);
            } else {
                console.log(error);
                throw new AnthropicApiError("Unable to talk with Claude.");
            }
        } else {
            console.log(error);
            throw new AnthropicApiError("Unable to talk with Claude.");
        }
    };
}
