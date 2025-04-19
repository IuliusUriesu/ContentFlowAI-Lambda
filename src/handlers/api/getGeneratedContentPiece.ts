import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse } from "../helpers/successResponse";
import { errorResponse } from "../helpers/errorResponse";
import DynamoDbService from "../../services/dynamodb/DynamoDbService";

const getGeneratedContentPiece = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const sub = event.requestContext.authorizer?.claims.sub;

    if (!sub) {
        return errorResponse(event, 401, "Claim 'sub' (user ID) is missing.");
    }

    const dynamoDbService = new DynamoDbService();

    let generatedContentId = event.pathParameters?.["generated-content-id"];
    if (!generatedContentId) {
        return errorResponse(event, 400, "Requested resource ID is missing.");
    }
    generatedContentId = decodeURIComponent(generatedContentId);

    try {
        const generatedContentPiece = await dynamoDbService.getGeneratedContentPiece({
            generatedContentFullId: generatedContentId,
        });

        if (!generatedContentPiece) {
            return errorResponse(event, 404, "Generated content piece not found.");
        }

        const generatedContentPieceUserId = generatedContentPiece.PK.split("#")[1];
        if (generatedContentPieceUserId !== sub) {
            return errorResponse(event, 404, "Generated content piece not found.");
        }

        return successResponse(event, 200, generatedContentPiece);
    } catch (error) {
        console.log(error);
        return errorResponse(event, 500, "Internal server error");
    }
};

export default getGeneratedContentPiece;
