import { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  DeleteEventUseCase,
  tokenDeleteEventUseCase,
} from '@trackflix-live/api-events';
import {
  BadRequestError,
  handleHttpRequest,
  NotFoundError,
} from '../HttpErrors';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import { inject } from '@trackflix-live/di';
import { EventDoesNotExistError } from '@trackflix-live/types';

export class DeleteEventAdapter {
  private readonly useCase: DeleteEventUseCase = inject(
    tokenDeleteEventUseCase
  );

  public async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return handleHttpRequest({
      event,
      func: this.processRequest.bind(this),
    });
  }

  public async processRequest(event: APIGatewayProxyEventV2) {
    const { eventId } = event.pathParameters || {};

    if (!eventId) {
      throw new BadRequestError();
    }

    try {
      await this.useCase.deleteEvent(eventId);
    } catch (error) {
      if (error instanceof EventDoesNotExistError) {
        throw new NotFoundError();
      }

      throw error;
    }
  }
}
