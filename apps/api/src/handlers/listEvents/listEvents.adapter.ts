import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { handleHttpRequest } from '../HttpErrors';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import { ListEventsUseCase } from '@trackflix-live/api-events';

export class ListEventsAdapter {
  private readonly useCase: ListEventsUseCase;

  public constructor({ useCase }: { useCase: ListEventsUseCase }) {
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
    const result = await this.useCase.listEvents();

    return {
      events: result,
    };
  }
}
