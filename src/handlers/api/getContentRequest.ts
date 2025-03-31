import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse } from "../helpers/successResponse";
import { errorResponse } from "../helpers/errorResponse";
import DynamoDbService from "../../services/dynamodb/DynamoDbService";

const getContentRequest = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const sub = event.requestContext.authorizer?.claims.sub;

    if (!sub) {
        return errorResponse(401, "Claim 'sub' (user ID) is missing.");
    }

    const dynamoDbService = new DynamoDbService();

    let contentRequestId = event.pathParameters?.["content-request-id"];
    if (!contentRequestId) {
        return errorResponse(400, "Requested resource ID is missing.");
    }
    contentRequestId = decodeURIComponent(contentRequestId);

    try {
        const contentRequest = await dynamoDbService.getContentRequest({
            userId: sub,
            contentRequestFullId: contentRequestId,
        });

        if (!contentRequest) {
            return errorResponse(404, "Content request not found.");
        }

        return successResponse(200, contentRequest);
    } catch (error) {
        console.log(error);
        return errorResponse(500, "Internal server error");
    }
};

export default getContentRequest;
