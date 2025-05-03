import { SqsService } from "./SqsService";

export default class SqsServiceProvider {
    private static sqsService: SqsService | null = null;

    static getService(): SqsService {
        if (!SqsServiceProvider.sqsService) {
            SqsServiceProvider.sqsService = new SqsService();
        }
        return SqsServiceProvider.sqsService;
    }
}
