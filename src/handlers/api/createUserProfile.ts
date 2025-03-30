import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { BadRequestError, getEnvVariable } from "../../utils/utils";
import DynamoDbService from "../../services/dynamodb/DynamoDbService";
import SqsService from "../../services/sqs/SqsService";
import { errorResponse } from "../helpers/errorResponse";
import { successResponse } from "../helpers/successResponse";
import { BrandDetails } from "../../models/BrandDetails";
import { ContentPiece } from "../../models/ContentPiece";

const createUserProfile = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const sub = event.requestContext.authorizer?.claims.sub;
    const fullName = event.requestContext.authorizer?.claims.name;

    if (!sub) {
        return errorResponse(401, "Claim 'sub' (user ID) is missing.");
    }

    if (!fullName) {
        return errorResponse(400, "Claim 'name' (full name) is missing.");
    }

    if (!event.body) {
        return errorResponse(400, "Request body is empty.");
    }

    const dynamoDbService = new DynamoDbService();
    const sqsService = new SqsService();

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return errorResponse(400, "Request body is invalid JSON.");
    }

    let brandDetails: BrandDetails;
    try {
        brandDetails = extractBrandDetails(body);
    } catch (error) {
        return errorResponse(400, (error as Error).message);
    }

    const existingContent = extractExistingContent(body);

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

        return successResponse(201, responseBody);
    } catch (error) {
        console.log(error);
        return errorResponse(500, "Internal server error");
    }
};

const extractBrandDetails = (body: any): BrandDetails => {
    const brandDetails = body.brandDetails;
    if (!brandDetails) {
        throw new BadRequestError("Brand details are missing.");
    }

    const { brandThemes, toneOfVoice, targetAudience, contentGoals } = brandDetails;

    if (!brandThemes || typeof brandThemes !== "string") {
        throw new BadRequestError("Required field 'brandThemes' is missing or invalid.");
    }

    if (!toneOfVoice || typeof toneOfVoice !== "string") {
        throw new BadRequestError("Required field 'toneOfVoice' is missing or invalid.");
    }

    if (!targetAudience || typeof targetAudience !== "string") {
        throw new BadRequestError("Required field 'targetAudience' is missing or invalid.");
    }

    if (!contentGoals || typeof contentGoals !== "string") {
        throw new BadRequestError("Required field 'contentGoals' is missing or invalid.");
    }

    return { brandThemes, toneOfVoice, targetAudience, contentGoals };
};

const extractExistingContent = (body: any): ContentPiece[] => {
    const existingContent = body.existingContent;
    if (!existingContent) return [];
    if (!Array.isArray(existingContent)) return [];

    const existingContentPieces: ContentPiece[] = [];
    for (let i = 0; i < existingContent.length; i++) {
        const piece = existingContent[i];
        const { format, content } = piece;
        if (format && content && typeof format === "string" && typeof content === "string") {
            existingContentPieces.push({ format, content });
        }
    }

    return existingContentPieces;
};

export default createUserProfile;
