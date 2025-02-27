import { GetEventAdapter } from './getEvent.adapter';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { EventMother } from '@trackflix-live/types';
import { register, reset } from 'di';
import { tokenGetEventUseCase } from '@trackflix-live/api-events';

describe('Get event adapter', () => {
  it('should call use case', async () => {
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
    const { adapter } = setup();

    const response = await adapter.handle({} as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
  });

  it('should return 404 response if event is not found', async () => {
    const { adapter, useCase } = setup();

    useCase.getEvent.mockImplementationOnce(() => undefined);

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
