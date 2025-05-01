import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getEnvVariable } from "../../utils/utils";
import { errorResponse } from "../helpers/errorResponse";
import { successResponse } from "../helpers/successResponse";
import { CreateUserProfileBodySchema } from "../../models/api/CreateUserProfileBody";
import { BrandDetailsCreateDto } from "../../models/dto/BrandDetailsCreateDto";
import { ContentPieceCreateDto } from "../../models/dto/ContentPieceCreateDto";
import DynamoDbServiceProvider from "../../services/dynamodb";
import SqsServiceProvider from "../../services/sqs";

const createUserProfile = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const sub = event.requestContext.authorizer?.claims.sub;
    const fullName = event.requestContext.authorizer?.claims.name;

    if (!sub) {
        return errorResponse(event, 401, "Claim 'sub' (user ID) is missing.");
    }

    if (!fullName) {
        return errorResponse(event, 400, "Claim 'name' (full name) is missing.");
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

    const parsedBody = CreateUserProfileBodySchema.safeParse(body);
    if (!parsedBody.success) {
        const issues = parsedBody.error.issues;
        const errorMessage = issues.length > 0 ? issues[0].message : "Request body is invalid.";
        return errorResponse(event, 400, errorMessage);
    }

    const brandDetails: BrandDetailsCreateDto = parsedBody.data.brandDetails;
    const existingContent: ContentPieceCreateDto[] = parsedBody.data.existingContent;

    const dynamoDbService = DynamoDbServiceProvider.getService();
    const sqsService = SqsServiceProvider.getService();

    const createUserProfilePromise = dynamoDbService.createUserProfile({
        userId: sub,
        fullName,
        brandDetails,
    });

    const createExistingContentPiecesPromise = dynamoDbService.createExistingContentPieces({
        userId: sub,
        existingContent,
    });

    try {
        const userProfile = await createUserProfilePromise;
        const existingContentPieces = await createExistingContentPiecesPromise;

        const brandSummaryRequestQueueUrl = getEnvVariable("BRAND_SUMMARY_REQUEST_QUEUE_URL");
        await sqsService.sendBrandSummaryRequestMessage({
            message: { userId: sub, brandDetails, existingContent },
            queueUrl: brandSummaryRequestQueueUrl,
        });

        const responseBody = {
            profile: userProfile,
            existingContent: existingContentPieces,
        };

        return successResponse(event, 201, responseBody);
    } catch (error) {
        console.log(error);
        return errorResponse(event, 500, "Internal server error");
    }
};

export default createUserProfile;
