import { AnthropicApiService } from "./AnthropicApiService";

export default class AnthropicApiServiceProvider {
    private static anthropicApiService: AnthropicApiService | null;

    constructor() {
        AnthropicApiServiceProvider.anthropicApiService = null;
    }

    static getService(): AnthropicApiService {
        if (!AnthropicApiServiceProvider.anthropicApiService) {
            AnthropicApiServiceProvider.anthropicApiService = AnthropicApiServiceProvider.createService();
        }
        return AnthropicApiServiceProvider.anthropicApiService;
    }

    private static createService(): AnthropicApiService {
        return new AnthropicApiService();
    }
}
