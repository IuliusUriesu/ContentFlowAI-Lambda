import getAnthropicClient from "./anthropicClient";

const getClaudeResponse = async (prompt: string): Promise<string> => {
    const anthropic = await getAnthropicClient();

    const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 20000,
        thinking: { type: "enabled", budget_tokens: 12000 },
        messages: [{ role: "user", content: prompt }],
    });

    const textMessage = response.content.filter((content) => content.type === "text");
    return textMessage[0].text;
};

export default getClaudeResponse;
