import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

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

export const handleHttpRequest = async ({
  event,
  func,
}: {
  event: APIGatewayProxyEventV2;
  func: (event: APIGatewayProxyEventV2) => Promise<unknown>;
}): Promise<APIGatewayProxyResultV2> => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(await func(event)),
    };
  } catch (e: unknown) {
    if (e instanceof HttpError) {
      return {
        statusCode: e.code,
        body: JSON.stringify({ message: e.message }),
      };
    }
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error.' }),
    };
  }
};
