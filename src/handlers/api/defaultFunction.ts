import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse } from "../helpers/successResponse";

const defaultFunction = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const body = {
        message: "Hello from the ContentFlowAI API!",
    };
    return successResponse(event, 200, body);
};

export default defaultFunction;
