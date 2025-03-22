import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { getEnvVariable, SqsError } from "../../utils/utils";
import { SqsSendUserProfileMessageInput } from "./interfaces";

class SqsService {
    private sqsClient: SQSClient;
    private userProfileQueueUrl: string;

    constructor() {
        const awsRegion = getEnvVariable("AWS_REGION");
        this.sqsClient = new SQSClient({ region: awsRegion });
        this.userProfileQueueUrl = getEnvVariable("USER_PROFILE_QUEUE_URL");
    }

    sendUserProfileMessage = async (input: SqsSendUserProfileMessageInput) => {
        const { message } = input;

        const command = new SendMessageCommand({
            QueueUrl: this.userProfileQueueUrl,
            MessageBody: JSON.stringify(message),
        });

        try {
            const response = await this.sqsClient.send(command);
        } catch (error) {
            console.log(error);
            throw new SqsError("Failed to send user profile message.");
        }
    };
}

export default SqsService;
