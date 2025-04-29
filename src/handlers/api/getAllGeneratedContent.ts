import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse } from "../helpers/successResponse";
import { errorResponse } from "../helpers/errorResponse";
import DynamoDbServiceProvider from "../../services/dynamodb";

const getAllGeneratedContent = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const sub = event.requestContext.authorizer?.claims.sub;

    if (!sub) {
        return errorResponse(event, 401, "Claim 'sub' (user ID) is missing.");
    }

    const contentRequestId = event.pathParameters?.["content-request-id"];
    if (!contentRequestId) {
        return errorResponse(event, 400, "Requested resource ID is missing.");
    }

    const dynamoDbService = DynamoDbServiceProvider.getService();

    try {
        const generatedContent = await dynamoDbService.getAllGeneratedContentByRequest({
            userId: sub,
            contentRequestId,
        });

        return successResponse(event, 200, generatedContent);
    } catch (error) {
        console.log(error);
        return errorResponse(event, 500, "Internal server error");
    }
};

export default getAllGeneratedContent;
