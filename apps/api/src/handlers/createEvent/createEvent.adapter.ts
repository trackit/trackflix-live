import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { tokenCreateEventUseCase } from '@trackflix-live/api-events';
import { BadRequestError, handleHttpRequest } from '../HttpErrors';
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import { CreateEventRequest, CreateEventResponse } from '@trackflix-live/types';
import { inject } from 'di';

const ajv = new Ajv();
addFormats(ajv);

const schema: JSONSchemaType<CreateEventRequest['body']> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    source: { type: 'string', format: 'uri' },
  },
  required: ['name', 'description', 'onAirStartTime', 'onAirEndTime', 'source'],
  additionalProperties: false,
};

const validate = ajv.compile(schema);

export class CreateEventAdapter {
  private readonly useCase = inject(tokenCreateEventUseCase);

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

    let body: undefined | CreateEventRequest['body'] = undefined;
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      throw new BadRequestError();
    }
    if (!validate(body)) {
      throw new BadRequestError();
    }

    const result = await this.useCase.createEvent(body);

    return {
      event: result,
    } satisfies CreateEventResponse['body'];
  }
}
