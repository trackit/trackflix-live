import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { BadRequestError, handleHttpRequest } from '../HttpErrors';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import { ListEventsUseCase } from '@trackflix-live/api-events';
import Ajv, { JSONSchemaType } from 'ajv';
import { ListEventsRequest, ListEventsResponse } from '@trackflix-live/types';

const ajv = new Ajv();

const isValidBase64Json = (schemaValue: boolean, value: string) => {
  if (!schemaValue) return true;

  try {
    JSON.parse(Buffer.from(value, 'base64').toString());
    return true;
  } catch {
    return false;
  }
};

const isValidLimit = (schemaValue: boolean, value: string) => {
  if (!schemaValue) return true;

  const limit = Number(value);

  return !isNaN(limit) && limit > 0 && limit <= 250;
};

ajv.addKeyword({
  keyword: 'isValidBase64Json',
  type: 'string',
  validate: isValidBase64Json,
  errors: false,
});

ajv.addKeyword({
  keyword: 'isValidLimit',
  type: 'string',
  validate: isValidLimit,
  errors: false,
});

const schema: JSONSchemaType<ListEventsRequest['queryStringParameters']> = {
  type: 'object',
  properties: {
    limit: { type: 'string', nullable: true, isValidLimit: true },
    nextToken: { type: 'string', nullable: true, isValidBase64Json: true },
    sortBy: {
      type: 'string',
      nullable: true,
      enum: ['name', 'onAirStartTime', 'onAirEndTime', 'status'],
    },
    sortOrder: { type: 'string', nullable: true, enum: ['asc', 'desc'] },
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
    const { limit, nextToken, sortBy, sortOrder } =
      queryParams as ListEventsRequest['queryStringParameters'];

    if (!ajv.validate(schema, queryParams)) {
      throw new BadRequestError();
    }

    const parsedLimit = Number(limit) || 10;

    return (await this.useCase.listEvents({
      limit: parsedLimit,
      nextToken,
      sortBy,
      sortOrder,
    })) satisfies ListEventsResponse['body'];
  }
}
