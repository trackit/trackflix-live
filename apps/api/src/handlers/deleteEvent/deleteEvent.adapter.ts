import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { DeleteEventUseCase } from '@trackflix-live/api-events';
import {
  BadRequestError,
  handleHttpRequest,
  NotFoundError,
} from '../HttpErrors';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';

export class DeleteEventAdapter {
  private readonly useCase: DeleteEventUseCase;

  public constructor({ useCase }: { useCase: DeleteEventUseCase }) {
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
    const { eventId } = event.pathParameters || {};

    if (!eventId) {
      throw new BadRequestError();
    }

    try {
      await this.useCase.deleteEvent(eventId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError();
      }
      throw error;
    }
  }
}
