import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { BadRequestError, handleHttpRequest } from '../HttpErrors';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import { ListEventsUseCase } from '@trackflix-live/api-events';
import Ajv, { JSONSchemaType } from 'ajv';

const ajv = new Ajv();

interface ListEventsRequest {
  limit?: number;
  nextToken?: string;
}

const isValidBase64Json = (value: string) => {
  try {
    const decoded = Buffer.from(value, 'base64').toString('utf-8');
    JSON.parse(decoded);
    return true;
  } catch {
    return false;
  }
};

ajv.addKeyword({
  keyword: 'isValidBase64Json',
  type: 'string',
  validate: isValidBase64Json,
  errors: false,
});

const schema: JSONSchemaType<ListEventsRequest> = {
  type: 'object',
  properties: {
    limit: { type: 'number', nullable: true, minimum: 1, maximum: 250 },
    nextToken: { type: 'string', nullable: true, isValidBase64Json: true },
  },
};

export class ListEventsAdapter {
  private readonly useCase: ListEventsUseCase;

  public constructor({ useCase }: { useCase: ListEventsUseCase }) {
    this.useCase = useCase;
  }

  public async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return handleHttpRequest({
      event,
      func: this.processRequest.bind(this),
    });
  }

  public async processRequest(event: APIGatewayProxyEventV2) {
    const queryParams = event.queryStringParameters || {};

    if (!ajv.validate(schema, queryParams)) {
      throw new BadRequestError();
    }

    const limit = Number(queryParams.limit) || 10;
    const nextToken = queryParams.nextToken;

    return await this.useCase.listEvents(limit, nextToken);
  }
}
