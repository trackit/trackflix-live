import { ListEventsAdapter } from './listEvents.adapter';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

describe('List events adapter', () => {
  it('should call use case', async () => {
    const { adapter, useCase } = setup();

    await adapter.handle({} as APIGatewayProxyEventV2);

    expect(useCase.listEvents).toHaveBeenCalled();
  });

  it('should return a successful response', async () => {
    const { adapter, useCase, sampleEvent } = setup();
    useCase.listEvents.mockImplementationOnce(() => ({
      events: [sampleEvent],
      nextToken: null,
    }));

    const response = await adapter.handle({} as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({
      events: [sampleEvent],
      nextToken: null,
    });
  });

  it('should return a successful response if nextToken is valid', async () => {
    const { adapter, useCase, sampleEvent } = setup();

    useCase.listEvents.mockImplementationOnce(() => ({
      events: [sampleEvent],
      nextToken: null,
    }));

    const response = await adapter.handle({
      queryStringParameters: {
        limit: '2',
        nextToken: Buffer.from(JSON.stringify({ id: sampleEvent.id })).toString(
          'base64'
        ),
      } as unknown,
    } as APIGatewayProxyEventV2);
    const body = JSON.parse(response.body || '');

    expect(response.statusCode).toEqual(200);
    expect(body.events).toHaveLength(1);
    expect(body.nextToken).toBeNull();
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
    const { adapter } = setup();

    const response = await adapter.handle({
      queryStringParameters: {
        limit: '-1,',
      } as unknown,
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
  });

  it('should return a response with status code 400 if the nextToken is malformed', async () => {
    const { adapter } = setup();

    const response = await adapter.handle({
      queryStringParameters: {
        nextToken: 'invalid',
      } as unknown,
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
  });
});

const setup = () => {
  const useCase = {
    listEvents: jest.fn(),
  };

  const sampleEvent = {
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

  return {
    adapter: new ListEventsAdapter({
      useCase,
    }),
    useCase,
    sampleEvent,
  };
};
