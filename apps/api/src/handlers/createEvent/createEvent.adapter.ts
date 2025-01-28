import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { CreateEventUseCase } from '@trackflix-live/api-events';
import { BadRequestError, handleHttpRequest } from '../HttpErrors';
import { Event } from '@trackflix-live/types';
import Ajv, { JSONSchemaType } from "ajv"
import { CreateEventArgs } from "@trackflix-live/api-events";


const ajv = new Ajv();

const schema: JSONSchemaType<CreateEventArgs> = {
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

const validate = ajv.compile(schema)


export class CreateEventAdapter {
  private readonly useCase: CreateEventUseCase;

  public constructor({ useCase }: { useCase: CreateEventUseCase }) {
    this.useCase = useCase;
  }

  public async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    return handleHttpRequest({
      event,
      func: this.processRequest.bind(this),
    });
  }

  public async processRequest(event: APIGatewayProxyEventV2) {
    if (event.body === undefined) {
      throw new BadRequestError();
    }

    const body = JSON.parse(event.body);
    if (!validate(body)) {
      throw new BadRequestError();
    }

    const result = await this.useCase.createEvent(body);

    return {
      event: result,
    };
  }
}
