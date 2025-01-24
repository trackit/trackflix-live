import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { CreateEventUseCase } from '@trackflix-live/api-events';
import { BadRequestError, handleHttpRequest } from '../HttpErrors';

export class CreateEventAdapter {
  private readonly useCase: CreateEventUseCase;

  public constructor({ useCase }: { useCase: CreateEventUseCase }) {
    this.useCase = useCase;
  }

  public async handle(
    event: APIGatewayProxyEventV2,
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
    // TODO: Validate body schema

    const result = await this.useCase.createEvent(body);

    return {
      event: result,
    };
  }
}
