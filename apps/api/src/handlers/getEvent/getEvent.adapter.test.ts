import { GetEventAdapter } from './getEvent.adapter';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { EventMother } from '@trackflix-live/types';
import { register, reset } from '@trackflix-live/di';
import {
  tokenGetEventUseCase,
  EventDoesNotExistError,
} from '@trackflix-live/api-events';
import * as allure from 'allure-js-commons';

describe('Get event adapter', () => {
  it('should call use case', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a viewer, I want to view a live event');
    await allure.owner('Nathan de Balthasar');
    await allure.severity('normal');

    const { adapter, useCase } = setup();

    const event = EventMother.basic().build();

    await adapter.handle({
      pathParameters: {
        eventId: event.id,
      } as unknown,
    } as APIGatewayProxyEventV2);

    expect(useCase.getEvent).toHaveBeenCalledWith(event.id);
  });

  it('should return successful response', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a viewer, I want to view a live event');
    await allure.owner('Nathan de Balthasar');
    await allure.severity('normal');

    const { adapter, useCase } = setup();

    const event = EventMother.basic().build();
    useCase.getEvent.mockImplementationOnce(() => event);

    const response = await adapter.handle({
      pathParameters: {
        eventId: event.id,
      } as unknown,
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({
      event,
    });
  });

  it('should return 400 response if no id is provided', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a viewer, I want to view a live event');
    await allure.owner('Nathan de Balthasar');
    await allure.severity('normal');

    const { adapter } = setup();

    const response = await adapter.handle({} as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
  });

  it('should return 404 response if event is not found', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a viewer, I want to view a live event');
    await allure.owner('Nathan de Balthasar');
    await allure.severity('normal');

    const { adapter, useCase } = setup();

    useCase.getEvent.mockRejectedValue(new EventDoesNotExistError());

    const response = await adapter.handle({
      pathParameters: {
        eventId: 'invalid-id',
      } as unknown,
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(404);
  });
});

const setup = () => {
  reset();

  const useCase = {
    getEvent: jest.fn(),
  };
  register(tokenGetEventUseCase, { useValue: useCase });

  return {
    adapter: new GetEventAdapter(),
    useCase,
  };
};
