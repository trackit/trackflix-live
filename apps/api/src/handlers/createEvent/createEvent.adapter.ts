import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { CreateEventUseCase } from '@trackflix-live/api-events';
import { BadRequestError, handleHttpRequest } from '../HttpErrors';
import Ajv, { JSONSchemaType } from 'ajv';
import { CreateEventArgs } from '@trackflix-live/api-events';
import addFormats from 'ajv-formats';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';

const ajv = new Ajv();
addFormats(ajv);

export type CreateEventBody = Omit<
  CreateEventArgs,
  'onAirStartTime' | 'onAirEndTime'
> & {
  onAirStartTime: string;
  onAirEndTime: string;
};

const schema: JSONSchemaType<CreateEventBody> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    source: {
      type: 'object',
      properties: {
        bucket: { type: 'string' },
        key: { type: 'string' },
      },
      required: ['bucket', 'key'],
      additionalProperties: false,
    },
  },
  required: ['name', 'description', 'onAirStartTime', 'onAirEndTime', 'source'],
  additionalProperties: false,
};

const validate = ajv.compile(schema);

export class CreateEventAdapter {
  private readonly useCase: CreateEventUseCase;

  public constructor({ useCase }: { useCase: CreateEventUseCase }) {
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
    if (event.body === undefined) {
      throw new BadRequestError();
    }

    let body: undefined | CreateEventBody = undefined;
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      throw new BadRequestError();
    }
    if (!validate(body)) {
      throw new BadRequestError();
    }

    const result = await this.useCase.createEvent({
      ...body,
      onAirStartTime: new Date(body.onAirStartTime),
      onAirEndTime: new Date(body.onAirEndTime),
    } satisfies CreateEventArgs);

    return {
      event: result,
    };
  }
}
