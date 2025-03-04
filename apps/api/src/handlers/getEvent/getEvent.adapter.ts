import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { tokenGetEventUseCase } from '@trackflix-live/api-events';
import {
  BadRequestError,
  handleHttpRequest,
  NotFoundError,
} from '../HttpErrors';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import {
  EventDoesNotExistError,
  GetEventRequest,
  GetEventResponse,
} from '@trackflix-live/types';
import { inject } from '@trackflix-live/di';

export class GetEventAdapter {
  private readonly useCase = inject(tokenGetEventUseCase);

  public async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return handleHttpRequest({
      event,
      func: this.processRequest.bind(this),
    });
  }

  public async processRequest(event: APIGatewayProxyEventV2) {
    const pathParameters =
      event.pathParameters as GetEventRequest['pathParameters'];
    if (pathParameters?.eventId === undefined) {
      throw new BadRequestError();
    }

    try {
      const result = await this.useCase.getEvent(pathParameters.eventId);

      return { event: result } satisfies GetEventResponse['body'];
    } catch (error) {
      if (error instanceof EventDoesNotExistError) {
        throw new NotFoundError();
      }
      throw error;
    }
  }
}
