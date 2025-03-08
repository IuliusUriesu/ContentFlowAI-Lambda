import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const defaultHandler = async (
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
