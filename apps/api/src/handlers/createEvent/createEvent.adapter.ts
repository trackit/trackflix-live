import {
  AssetNotFoundError,
  AuthorizationError,
  tokenCreateEventUseCase,
} from '@trackflix-live/api-events';
import {
  BadRequestError,
  ForbiddenError,
  handleHttpRequest,
} from '../HttpErrors';
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import {
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda/trigger/api-gateway-proxy';
import { CreateEventRequest, CreateEventResponse } from '@trackflix-live/types';
import { inject } from '@trackflix-live/di';
import { CustomRequestContext } from '../types';

const ajv = new Ajv();
addFormats(ajv);

const schema: JSONSchemaType<CreateEventRequest['body']> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    source: { type: 'string', pattern: '^s3:\\/\\/.+\\.mp4$' },
  },
  required: ['name', 'description', 'onAirStartTime', 'onAirEndTime', 'source'],
  additionalProperties: false,
};

const validate = ajv.compile(schema);

export class CreateEventAdapter {
  private readonly useCase = inject(tokenCreateEventUseCase);

  public async handle(
    event: APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return handleHttpRequest({
      event,
      func: this.processRequest.bind(this),
    });
  }

  public async processRequest(
    event: APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>
  ) {
    const cognitoGroups =
      event.requestContext.authorizer?.claims['cognito:groups'] || [];
    const userGroups = Array.isArray(cognitoGroups)
      ? cognitoGroups
      : [cognitoGroups];

    if (event.body === undefined) {
      throw new BadRequestError('No body received.');
    }

    let body: undefined | CreateEventRequest['body'] = undefined;
    try {
      body = JSON.parse(event.body);
    } catch {
      throw new BadRequestError('Body is not valid JSON.');
    }
    if (!validate(body)) {
      throw new BadRequestError('Body does not match schema.');
    }
    this.validateInput(body);

    try {
      const result = await this.useCase.createEvent({
        ...body,
        userGroups,
      });

      return {
        event: result,
      } satisfies CreateEventResponse['body'];
    } catch (err: unknown) {
      switch (true) {
        case err instanceof AssetNotFoundError:
          throw new BadRequestError('Asset not found.');
        case err instanceof AuthorizationError:
          throw new ForbiddenError(
            'You are not authorized to perform this action.'
          );
        default:
          throw err;
      }
    }
  }

  private validateInput(input: CreateEventRequest['body']) {
    const validations = [
      this.startDateIsBeforeEndDate,
      this.startDateIsInFuture,
      this.startDateIsLessThan364YearsInTheFuture,
    ];

    validations.forEach((validation) => validation(input));
  }

  private startDateIsBeforeEndDate(input: CreateEventRequest['body']) {
    const startTime = new Date(input.onAirStartTime).getTime();
    const endTime = new Date(input.onAirEndTime).getTime();

    if (startTime >= endTime) {
      throw new BadRequestError('Start time should be before end time.');
    }
  }

  private startDateIsInFuture(input: CreateEventRequest['body']) {
    const startTime = new Date(input.onAirStartTime).getTime();
    const currentTime = Date.now();
    const minimumTime = currentTime + 6 * 60 * 1000;

    if (startTime < minimumTime) {
      throw new BadRequestError(
        'Start time should be at least 6 minutes in the future.'
      );
    }
  }

  private startDateIsLessThan364YearsInTheFuture(
    input: CreateEventRequest['body']
  ) {
    const startTime = new Date(input.onAirStartTime).getTime();
    const currentTime = Date.now();
    const maximumTime = currentTime + 364 * 24 * 60 * 60 * 1000;

    if (startTime > maximumTime) {
      throw new BadRequestError(
        'Start time should be at most 364 days in the future.'
      );
    }
  }
}
