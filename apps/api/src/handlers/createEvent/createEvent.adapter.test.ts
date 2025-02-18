import { CreateEventAdapter } from './createEvent.adapter';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { EventMother } from '@trackflix-live/types';

describe('Create event adapter', () => {
  it('should call use case', async () => {
    const { adapter, useCase, createEventReq } = setup();

    const event = EventMother.basic().build();

    await adapter.handle({
      body: JSON.stringify(createEventReq),
    } as APIGatewayProxyEventV2);

    expect(useCase.createEvent).toHaveBeenCalledWith({
      ...event,
      id: undefined,
      status: undefined,
      createdTime: undefined,
      endpoints: undefined,
      logs: undefined,
    });
  });

  it('should return successful response', async () => {
    const { adapter, useCase, createEventReq } = setup();
    const event = EventMother.basic().build();
    useCase.createEvent.mockImplementationOnce(() => event);

    const response = await adapter.handle({
      body: JSON.stringify(createEventReq),
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({ event });
  });

  it('should return 400 response if no body is provided', async () => {
    const { adapter } = setup();
    const response = await adapter.handle({
      body: undefined,
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
    });
  });

  it('should return 400 response if body is not json', async () => {
    const { adapter } = setup();
    const response = await adapter.handle({
      body: 'invalid json',
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
    });
  });

  it('should return 400 response if body does not match schema', async () => {
    const { adapter } = setup();
    const response = await adapter.handle({
      body: JSON.stringify({
        unknownField: 'unknownValue',
      }),
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
    });
  });
});

const setup = () => {
  const useCase = {
    createEvent: jest.fn(),
  };

  const event = EventMother.basic().build();
  const createEventReq = {
    ...event,
    createdTime: undefined,
    endpoints: undefined,
    status: undefined,
    id: undefined,
    logs: undefined,
  };

  return {
    adapter: new CreateEventAdapter({
      useCase,
    }),
    useCase,
    createEventReq,
  };
};
