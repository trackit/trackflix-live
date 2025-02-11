import { ListEventsAdapter } from './listEvents.adapter';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

describe('List events adapter', () => {
  it('should call use case', async () => {
    const { adapter, useCase } = setup();

    await adapter.handle({} as APIGatewayProxyEventV2);

    expect(useCase.listEvents).toHaveBeenCalled();
  });

  it('should return a successful response', async () => {
    const { adapter, useCase } = setup();
    const event = {
      name: 'First event',
      description: 'This is my first event.',
      onAirStartTime: '2025-02-04T15:15:31.606Z',
      onAirEndTime: '2025-02-04T16:21:50.292Z',
      source: {
        bucket: 'test',
        key: 'test',
      },
      id: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      status: 'PRE-TX',
    };
    useCase.listEvents.mockImplementationOnce(() => ({
      events: [event],
      nextToken: null,
    }));

    const response = await adapter.handle({} as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({
      events: [event],
      nextToken: null,
    });
  });

  it('should return a successful response if there are no events', async () => {
    const { adapter, useCase } = setup();
    useCase.listEvents.mockImplementationOnce(() => ({
      events: [],
      nextToken: null,
    }));

    const response = await adapter.handle({} as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({
      events: [],
      nextToken: null,
    });
  });

  it('should return a response with status code 400 if the limit is invalid', async () => {
    const { adapter, useCase } = setup();
    useCase.listEvents.mockImplementationOnce(() => ({
      events: [],
      nextToken: null,
    }));

    const response = await adapter.handle({
      queryStringParameters: {
        limit: -1,
      } as unknown,
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
  });
});

const setup = () => {
  const useCase = {
    listEvents: jest.fn(),
  };
  return {
    adapter: new ListEventsAdapter({
      useCase,
    }),
    useCase,
  };
};
