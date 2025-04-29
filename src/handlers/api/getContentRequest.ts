import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse } from "../helpers/successResponse";
import { errorResponse } from "../helpers/errorResponse";
import DynamoDbServiceProvider from "../../services/dynamodb";

const getContentRequest = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
        const contentRequest = await dynamoDbService.getContentRequest({
            userId: sub,
            contentRequestId,
        });

        if (!contentRequest) {
            return errorResponse(event, 404, "Content request not found.");
        }

        return successResponse(event, 200, contentRequest);
    } catch (error) {
        console.log(error);
        return errorResponse(event, 500, "Internal server error");
    }
};

export default getContentRequest;
