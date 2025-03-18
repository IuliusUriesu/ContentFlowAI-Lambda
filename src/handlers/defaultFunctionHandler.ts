import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse } from "../utils/utils";

const defaultFunctionHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const body = {
        message: "Hello from the ContentFlowAI API!",
    };
    return successResponse(200, body);
};

export default defaultFunctionHandler;
