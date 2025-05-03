import { AwsEncryptionSdkService } from "./AwsEncryptionSdkService";

export default class AwsEncryptionSdkServiceProvider {
    private static awsEncryptionSdkService: AwsEncryptionSdkService | null = null;

    static getService(): AwsEncryptionSdkService {
        if (!AwsEncryptionSdkServiceProvider.awsEncryptionSdkService) {
            AwsEncryptionSdkServiceProvider.awsEncryptionSdkService = AwsEncryptionSdkServiceProvider.createService();
        }
        return AwsEncryptionSdkServiceProvider.awsEncryptionSdkService;
    }

    private static createService(): AwsEncryptionSdkService {
        return new AwsEncryptionSdkService();
    }
}
