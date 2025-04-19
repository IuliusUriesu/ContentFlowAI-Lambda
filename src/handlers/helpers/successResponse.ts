import { APIGatewayProxyResult, APIGatewayProxyEvent } from "aws-lambda";

export const successResponse = (event: APIGatewayProxyEvent, statusCode: number, body: any): APIGatewayProxyResult => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    const origin = event.headers.origin ?? event.headers.Origin;
    if (origin) {
        headers["Access-Control-Allow-Origin"] = origin;
    }

    return {
        statusCode,
        headers,
        body: JSON.stringify(body),
    };
};
