import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { GetEventUseCase } from '@trackflix-live/api-events';
import {
  BadRequestError,
  handleHttpRequest,
  NotFoundError,
} from '../HttpErrors';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';

export class GetEventAdapter {
  private readonly useCase: GetEventUseCase;

  public constructor({ useCase }: { useCase: GetEventUseCase }) {
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
    if (eventId === undefined) {
      throw new BadRequestError();
    }

    const result = await this.useCase.getEvent(eventId);

    if (!result) {
      throw new NotFoundError();
    }

    return { event: result };
  }
}
