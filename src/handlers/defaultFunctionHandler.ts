import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const defaultFunctionHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: "Hello from the ContentFlowAI API!",
        }),
    };
};

export default defaultFunctionHandler;
