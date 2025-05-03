import { SqsService } from "./SqsService";

export default class SqsServiceProvider {
    private static sqsService: SqsService | null = null;

    static getService(): SqsService {
        if (!SqsServiceProvider.sqsService) {
            SqsServiceProvider.sqsService = SqsServiceProvider.createService();
        }
        return SqsServiceProvider.sqsService;
    }

    private static createService(): SqsService {
        return new SqsService();
    }
}
