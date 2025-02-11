import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import { CORS_HEADERS } from './constants';

export class HttpError extends Error {
  public readonly code: number;

  public readonly message: string;

  public constructor({ code, message }: { code: number; message: string }) {
    super();

    this.code = code;
    this.message = message;
  }
}

export class BadRequestError extends HttpError {
  public constructor() {
    super({
      code: 400,
      message: 'Bad Request',
    });
  }
}

export class NotFoundError extends HttpError {
  public constructor() {
    super({
      code: 404,
      message: 'Not Found',
    });
  }
}

export const handleHttpRequest = async ({
  event,
  func,
}: {
  event: APIGatewayProxyEventV2;
  func: (event: APIGatewayProxyEventV2) => Promise<unknown>;
}): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(await func(event)),
    };
  } catch (e: unknown) {
    if (e instanceof HttpError) {
      return {
        statusCode: e.code,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: e.message }),
      };
    }
    console.error(e);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Internal Server Error.' }),
    };
  }
};
