import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { BadRequestError, BrandDetails, errorResponse, ExistingContentPiece, successResponse } from "../utils/utils";
import DynamoDbService from "../services/dynamodb/DynamoDbService";
import SqsService from "../services/sqs/SqsService";

const createUserProfileHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

    const dynamoDbService = new DynamoDbService();
    const sqsService = new SqsService();

    const createUserProfilePromise = dynamoDbService.createUserProfile({
        userId: sub,
        fullName,
        brandDetails,
    });

    const createExistingContentPiecesPromise = dynamoDbService.createExistingContentPieces({
        userId: sub,
        existingContent,
    });

    const sendUserProfileMessagePromise = sqsService.sendUserProfileMessage({
        message: { brandDetails, existingContent },
    });

    try {
        const userProfile = await createUserProfilePromise;
        const existingContentPieces = await createExistingContentPiecesPromise;
        await sendUserProfileMessagePromise;

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
    const { brandThemes, toneOfVoice, targetAudience, contentGoals } = body;

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

const extractExistingContent = (body: any): ExistingContentPiece[] => {
    const existingContent = body.existingContent;
    if (!existingContent) return [];
    if (!Array.isArray(existingContent)) return [];

    const existingContentPieces: ExistingContentPiece[] = [];
    for (let i = 0; i < existingContent.length; i++) {
        const piece = existingContent[i];
        const { format, content } = piece;
        if (format && content && typeof format === "string" && typeof content === "string") {
            existingContentPieces.push({ format, content });
        }
    }

    return existingContentPieces;
};

export default createUserProfileHandler;
