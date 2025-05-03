import { buildClient, CommitmentPolicy, KmsKeyringNode } from "@aws-crypto/client-node";
import { AwsEncryptionSdkError, getEnvVariable } from "../../utils/utils";

export class AwsEncryptionSdkService {
    private client: ReturnType<typeof buildClient>;
    private userAnthropicApiKeyKeyring: KmsKeyringNode;

    constructor() {
        this.client = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT);
        const userAnthropicApiKeyMasterKeyArn = getEnvVariable("USER_ANTHROPIC_API_KEY_MASTER_KEY_ARN");
        this.userAnthropicApiKeyKeyring = new KmsKeyringNode({ generatorKeyId: userAnthropicApiKeyMasterKeyArn });
    }

    encryptUserAnthropicApiKey = async (apiKey: string) => {
        const context = {
            description: "Encrypt the Anthropic API key of a user",
        };

        try {
            const encrypted = await this.client.encrypt(this.userAnthropicApiKeyKeyring, apiKey, {
                encryptionContext: context,
            });
            return encrypted.result;
        } catch (error) {
            console.log(error);
            throw new AwsEncryptionSdkError("Failed to encrypt user Anthropic API key.");
        }
    };

    decryptUserAnthropicApiKey = async (encryptedApiKey: Buffer): Promise<string> => {
        try {
            const decrypted = await this.client.decrypt(this.userAnthropicApiKeyKeyring, encryptedApiKey);
            return decrypted.plaintext.toString();
        } catch (error) {
            console.log(error);
            throw new AwsEncryptionSdkError("Failed to decrypt user Anthropic API key.");
        }
    };
}
