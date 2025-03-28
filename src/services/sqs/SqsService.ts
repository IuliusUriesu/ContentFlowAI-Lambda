import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { getEnvVariable, SqsError } from "../../utils/utils";
import { SqsSendBrandSummaryRequestMessageInput } from "./types";

class SqsService {
    private sqsClient: SQSClient;

    constructor() {
        const awsRegion = getEnvVariable("AWS_REGION");
        this.sqsClient = new SQSClient({ region: awsRegion });
    }

    sendBrandSummaryRequestMessage = async (input: SqsSendBrandSummaryRequestMessageInput) => {
        const { message, queueUrl } = input;

        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(message),
        });

        try {
            await this.sqsClient.send(command);
        } catch (error) {
            console.log(error);
            throw new SqsError("Failed to send brand summary request message.");
        }
    };
}

export default SqsService;
