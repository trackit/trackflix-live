import { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  DeleteEventUseCase,
  EventCannotBeDeletedWhileOnAirError,
  tokenDeleteEventUseCase,
  EventDoesNotExistError,
  EventCannotBeDeletedIfNotOnPreTxError,
} from '@trackflix-live/api-events';
import {
  BadRequestError,
  ForbiddenError,
  handleHttpRequest,
  NotFoundError,
} from '../HttpErrors';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import { inject } from '@trackflix-live/di';
import { DeleteEventRequest, DeleteEventResponse } from '@trackflix-live/types';
import { CustomRequestContext } from '../createEvent/createEvent.adapter';

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
    const customContext = event.requestContext as CustomRequestContext;
    const groups = customContext.authorizer?.claims['cognito:groups'] || [];

    if (
      !(groups === 'Creators') &&
      !(Array.isArray(groups) && groups.includes('Creators'))
    ) {
      throw new ForbiddenError('Viewers are not authorized to delete events');
    }

    const pathParameters =
      event.pathParameters as DeleteEventRequest['pathParameters'];
    if (pathParameters?.eventId === undefined) {
      throw new BadRequestError();
    }

    try {
      await this.useCase.deleteEvent(pathParameters.eventId);
    } catch (error) {
      switch (true) {
        case error instanceof EventDoesNotExistError:
          throw new NotFoundError();
        case error instanceof EventCannotBeDeletedIfNotOnPreTxError:
          throw new BadRequestError('Event cannot be deleted if not on pre tx');
        case error instanceof EventCannotBeDeletedWhileOnAirError:
          throw new BadRequestError('Event cannot be deleted while on air');
        default:
          throw error;
      }
    }

    return {
      status: 'Ok',
    } satisfies DeleteEventResponse['body'];
  }
}
