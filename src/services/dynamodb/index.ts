import { DynamoDbService } from "./DynamoDbService";

export default class DynamoDbServiceProvider {
    private static dynamoDbService: DynamoDbService | null;

    constructor() {
        DynamoDbServiceProvider.dynamoDbService = null;
    }

    static getService(): DynamoDbService {
        if (!DynamoDbServiceProvider.dynamoDbService) {
            DynamoDbServiceProvider.dynamoDbService = DynamoDbServiceProvider.createService();
        }
        return DynamoDbServiceProvider.dynamoDbService;
    }

    private static createService(): DynamoDbService {
        return new DynamoDbService();
    }
}
