import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { getEnvVariable, SqsError } from "../../utils/utils";
import {
    SqsSendBrandSummaryRequestMessageInput,
    SqsSendContentRequestMessageInput,
    SqsSendMessageInput,
} from "./types";

class SqsService {
    private sqsClient: SQSClient;

    constructor() {
        const awsRegion = getEnvVariable("AWS_REGION");
        this.sqsClient = new SQSClient({ region: awsRegion });
    }

    sendBrandSummaryRequestMessage = async (input: SqsSendBrandSummaryRequestMessageInput) => {
        const { message, queueUrl } = input;
        try {
            await this.sendMessage({ message: JSON.stringify(message), queueUrl });
        } catch (error) {
            throw new SqsError("Failed to send brand summary message.");
        }
    };

    sendContentRequestMessage = async (input: SqsSendContentRequestMessageInput) => {
        const { message, queueUrl } = input;
        try {
            await this.sendMessage({ message: JSON.stringify(message), queueUrl });
        } catch (error) {
            throw new SqsError("Failed to send content request message.");
        }
    };

    private sendMessage = async (input: SqsSendMessageInput) => {
        const { message, queueUrl } = input;

        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: message,
        });

        try {
            await this.sqsClient.send(command);
        } catch (error) {
            console.log(error);
            throw new SqsError("Failed to send message.");
        }
    };
}

export default SqsService;
