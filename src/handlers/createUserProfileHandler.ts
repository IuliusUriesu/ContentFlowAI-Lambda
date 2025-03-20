import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { BadRequestError, errorResponse, ExistingContentPiece, successResponse } from "../utils/utils";
import dynamoDbService from "../data-access";

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

    try {
        validateRequestBody(body);
    } catch (error) {
        return errorResponse(400, (error as Error).message);
    }

    const createUserProfilePromise = dynamoDbService.createUserProfile(
        sub,
        fullName,
        body.brandThemes,
        body.toneOfVoice,
        body.targetAudience,
        body.contentGoals,
    );

    const existingContent = extractExistingContent(body);
    const createExistingContentPiecesPromise = dynamoDbService.createExistingContentPieces(sub, existingContent);

    try {
        const userProfile = await createUserProfilePromise;
        const existingContentPieces = await createExistingContentPiecesPromise;

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

const validateRequestBody = (body: any) => {
    const { brandThemes, toneOfVoice, targetAudience, contentGoals, existingContent } = body;

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
