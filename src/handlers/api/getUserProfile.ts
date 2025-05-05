import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse } from "../helpers/successResponse";
import { errorResponse } from "../helpers/errorResponse";
import DynamoDbServiceProvider from "../../services/dynamodb";

const getUserProfile = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const sub = event.requestContext.authorizer?.claims.sub;

    if (!sub) {
        return errorResponse(event, 401, "Claim 'sub' (user ID) is missing.");
    }

    const dynamoDbService = DynamoDbServiceProvider.getService();

    try {
        const userProfile = await dynamoDbService.getUserProfile({ userId: sub });

        if (!userProfile) {
            return errorResponse(event, 404, "User profile not found.");
        }

        return successResponse(event, 200, userProfile);
    } catch (error) {
        console.log(error);
        return errorResponse(event, 500, "Internal server error");
    }
};

export default getUserProfile;
