import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { DevelopmentError, getEnvVariable } from "../../utils/utils";
import Anthropic from "@anthropic-ai/sdk";
import { AnthropicApiGetClaudeResponseInput } from "./types";

export class AnthropicApiService {
    private anthropicClientPromise: Promise<Anthropic>;

    constructor() {
        this.anthropicClientPromise = this.createAnthropicClient();
    }

    getClaudeResponse = async (input: AnthropicApiGetClaudeResponseInput): Promise<string> => {
        const { prompt, thinking } = input;
        console.log(prompt);

        const anthropic = await this.anthropicClientPromise;

        const response = await anthropic.messages.create({
            model: "claude-3-7-sonnet-20250219",
            max_tokens: 20000,
            thinking: thinking === true ? { type: "enabled", budget_tokens: 12000 } : undefined,
            messages: [{ role: "user", content: prompt }],
        });

        const textMessage = response.content.filter((content) => content.type === "text");
        return textMessage[0].text;
    };

    private createAnthropicClient = async (): Promise<Anthropic> => {
        const apiKey = await this.getAnthropicApiKey();
        return new Anthropic({
            apiKey,
        });
    };

    private getAnthropicApiKey = async (): Promise<string> => {
        const client = new SecretsManagerClient();
        const secretName = getEnvVariable("ANTHROPIC_API_KEY_SECRET_NAME");
        const command = new GetSecretValueCommand({
            SecretId: secretName,
        });

        const response = await client.send(command);
        const secretJson = response.SecretString;
        if (!secretJson) {
            throw new DevelopmentError("Missing or invalid Anthropic API Key secret.");
        }

        const secretObject = JSON.parse(secretJson);
        if (!secretObject.ANTHROPIC_API_KEY || typeof secretObject.ANTHROPIC_API_KEY !== "string") {
            throw new DevelopmentError("Missing or invalid secret key ANTHROPIC_API_KEY.");
        }
        return secretObject.ANTHROPIC_API_KEY;
    };
}
