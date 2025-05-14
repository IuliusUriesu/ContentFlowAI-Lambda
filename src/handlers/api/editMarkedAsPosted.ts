import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse } from "../helpers/successResponse";
import { errorResponse } from "../helpers/errorResponse";
import DynamoDbServiceProvider from "../../services/dynamodb";
import { EditGeneratedContentPieceMarkedAsPostedBodySchema } from "../../models/api/EditGeneratedContentPieceMarkedAsPostedBody";

const editMarkedAsPosted = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const sub = event.requestContext.authorizer?.claims.sub;

    if (!sub) {
        return errorResponse(event, 401, "Claim 'sub' (user ID) is missing.");
    }

    if (!event.body) {
        return errorResponse(event, 400, "Request body is empty.");
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return errorResponse(event, 400, "Request body is invalid JSON.");
    }

    const generatedContentId = event.pathParameters?.["generated-content-id"];
    if (!generatedContentId) {
        return errorResponse(event, 400, "Requested resource ID is missing.");
    }

    const parsedBody = EditGeneratedContentPieceMarkedAsPostedBodySchema.safeParse(body);
    if (!parsedBody.success) {
        const issues = parsedBody.error.issues;
        const errorMessage = issues.length > 0 ? issues[0].message : "Request body is invalid.";
        return errorResponse(event, 400, errorMessage);
    }

    const { markedAsPosted } = parsedBody.data;

    const dynamoDbService = DynamoDbServiceProvider.getService();

    try {
        const generatedContentPiece = await dynamoDbService.getGeneratedContentPiece({
            generatedContentId,
        });

        if (!generatedContentPiece) {
            return errorResponse(event, 404, "Generated content piece not found.");
        }

        if (generatedContentPiece.userId !== sub) {
            return errorResponse(event, 404, "Generated content piece not found.");
        }

        const updatedGeneratedContentPiece = await dynamoDbService.updateGeneratedContentPieceMarkedAsPosted({
            userId: sub,
            contentRequestId: generatedContentPiece.contentRequestId,
            generatedContentId,
            markedAsPosted,
        });

        return successResponse(event, 200, updatedGeneratedContentPiece);
    } catch (error) {
        console.log(error);
        return errorResponse(event, 500, "Internal server error");
    }
};

export default editMarkedAsPosted;
