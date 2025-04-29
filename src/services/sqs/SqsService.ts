import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { getEnvVariable, SqsError } from "../../utils/utils";
import { SqsBrandSummaryRequestMessage, SqsContentRequestMessage, SqsSendMessageInput } from "./types";

export class SqsService {
    private sqsClient: SQSClient;

    constructor() {
        const awsRegion = getEnvVariable("AWS_REGION");
        this.sqsClient = new SQSClient({ region: awsRegion });
    }

    sendBrandSummaryRequestMessage = async (input: SqsSendMessageInput<SqsBrandSummaryRequestMessage>) => {
        try {
            await this.sendMessage(input);
        } catch (error) {
            console.log(error);
            throw new SqsError("Failed to send brand summary message.");
        }
    };

    sendContentRequestMessage = async (input: SqsSendMessageInput<SqsContentRequestMessage>) => {
        try {
            await this.sendMessage(input);
        } catch (error) {
            console.log(error);
            throw new SqsError("Failed to send content request message.");
        }
    };

    private sendMessage = async <T>(input: SqsSendMessageInput<T>) => {
        const { message, queueUrl } = input;

        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(message),
        });

        await this.sqsClient.send(command);
    };
}
