import { DynamoDbService } from "./DynamoDbService";

export default class DynamoDbServiceProvider {
    private static dynamoDbService: DynamoDbService | null = null;

    static getService(): DynamoDbService {
        if (!DynamoDbServiceProvider.dynamoDbService) {
            DynamoDbServiceProvider.dynamoDbService = new DynamoDbService();
        }
        return DynamoDbServiceProvider.dynamoDbService;
    }
}
