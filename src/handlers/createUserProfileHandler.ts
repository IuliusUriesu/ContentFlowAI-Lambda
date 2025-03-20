import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { BadRequestError, errorResponse, successResponse } from "../utils/utils";
import updateBrandDetailsDb from "../data-access/updateBrandDetailsDb";

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
        return errorResponse(400, "Empty error body.");
    }

    const body = JSON.parse(event.body);
    try {
        validateRequestBody(body);
    } catch (error) {
        return errorResponse(400, (error as BadRequestError).message);
    }

    try {
        const response = await updateBrandDetailsDb(
            sub,
            fullName,
            body.brandThemes,
            body.toneOfVoice,
            body.targetAudience,
            body.contentGoals,
        );
        return successResponse(200, response);
    } catch (error) {
        console.log(error);
        return errorResponse(500, "Internal Server Error");
    }
};

const validateRequestBody = (body: any) => {
    const { brandThemes, toneOfVoice, targetAudience, contentGoals } = body;

    if (!brandThemes || typeof brandThemes !== "string") {
        throw new BadRequestError("'brandThemes' is required and must be a string.");
    }

    if (!toneOfVoice || typeof toneOfVoice !== "string") {
        throw new BadRequestError("'toneOfVoice' is required and must be a string.");
    }

    if (!targetAudience || typeof targetAudience !== "string") {
        throw new BadRequestError("'targetAudience' is required and must be a string.");
    }

    if (!contentGoals || typeof contentGoals !== "string") {
        throw new BadRequestError("'contentGoals' is required and must be a string.");
    }
};

export default createUserProfileHandler;
