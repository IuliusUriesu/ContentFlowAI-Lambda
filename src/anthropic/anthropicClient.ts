import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicApiKey } from "../utils/utils";

let anthropicClientPromise: Promise<Anthropic> | undefined;

const createAnthropicClient = async (): Promise<Anthropic> => {
    const apiKey = await getAnthropicApiKey();
    return new Anthropic({
        apiKey,
    });
};

const getAnthropicClient = (): Promise<Anthropic> => {
    if (!anthropicClientPromise) {
        anthropicClientPromise = createAnthropicClient();
    }
    return anthropicClientPromise;
};

export default getAnthropicClient;
