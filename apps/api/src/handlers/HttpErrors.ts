import {
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda/trigger/api-gateway-proxy';
import { CORS_HEADERS } from './constants';
import { CustomRequestContext } from './types';

export class HttpError extends Error {
  public readonly code: number;

  public readonly message: string;

  public readonly description?: string;

  public constructor({
    code,
    message,
    description,
  }: {
    code: number;
    message: string;
    description?: string;
  }) {
    super();

    this.code = code;
    this.message = message;
    this.description = description;
  }
}

export class BadRequestError extends HttpError {
  public constructor(description?: string) {
    super({
      code: 400,
      message: 'Bad Request',
      description,
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

export class ForbiddenError extends HttpError {
  public constructor(description?: string) {
    super({
      code: 403,
      message: 'Forbidden',
      description,
    });
  }
}

export const handleHttpRequest = async ({
  event,
  func,
}: {
  event: APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>;
  func: (
    event: APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>
  ) => Promise<unknown>;
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
        body: JSON.stringify({
          message: e.message,
          description: e.description,
        }),
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
