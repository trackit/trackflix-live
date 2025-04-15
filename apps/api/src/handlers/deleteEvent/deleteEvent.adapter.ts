import {
  DeleteEventUseCase,
  EventCannotBeDeletedWhileOnAirError,
  tokenDeleteEventUseCase,
  EventDoesNotExistError,
  EventCannotBeDeletedIfNotOnPreTxError,
  AuthorizationError,
} from '@trackflix-live/api-events';
import {
  BadRequestError,
  ForbiddenError,
  handleHttpRequest,
  NotFoundError,
} from '../HttpErrors';
import {
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda/trigger/api-gateway-proxy';
import { inject } from '@trackflix-live/di';
import { DeleteEventRequest, DeleteEventResponse } from '@trackflix-live/types';
import { CustomRequestContext } from '../types';

export class DeleteEventAdapter {
  private readonly useCase: DeleteEventUseCase = inject(
    tokenDeleteEventUseCase
  );

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

    const pathParameters =
      event.pathParameters as DeleteEventRequest['pathParameters'];
    if (pathParameters?.eventId === undefined) {
      throw new BadRequestError();
    }

    try {
      await this.useCase.deleteEvent({
        eventId: pathParameters.eventId,
        userGroups,
      });
    } catch (error) {
      switch (true) {
        case error instanceof EventDoesNotExistError:
          throw new NotFoundError();
        case error instanceof EventCannotBeDeletedIfNotOnPreTxError:
          throw new BadRequestError('Event cannot be deleted if not on pre tx');
        case error instanceof EventCannotBeDeletedWhileOnAirError:
          throw new BadRequestError('Event cannot be deleted while on air');
        case error instanceof AuthorizationError:
          throw new ForbiddenError(
            'You are not authorized to perform this action.'
          );
        default:
          throw error;
      }
    }

    return {
      status: 'Ok',
    } satisfies DeleteEventResponse['body'];
  }
}
