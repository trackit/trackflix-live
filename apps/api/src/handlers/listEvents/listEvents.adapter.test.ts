import { ListEventsAdapter } from './listEvents.adapter';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { EventMother } from '@trackflix-live/types';

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

  it('should return a successful response if a sort attribute is defined', async () => {
    const { adapter, useCase } = setup();
    const event1 = EventMother.basic()
      .withId('bbaf9b7d-5f75-468d-b81d-8ba7637af888')
      .withName('Event 1')
      .build();
    const event2 = EventMother.basic()
      .withId('7d64ba46-8c8e-41e8-87fc-a3c1b02cda76')
      .withName('Event 2')
      .build();

    useCase.listEvents.mockImplementationOnce(() => ({
      events: [event1, event2],
      nextToken: null,
    }));

    const response = await adapter.handle({
      queryStringParameters: {
        limit: '2',
        sortBy: 'name',
        sortOrder: 'asc',
      } as unknown,
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({
      events: [event1, event2],
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

  it('should return a response with status code 400 if the sortOrder is specified without sortBy', async () => {
    const { adapter } = setup();

    const response = await adapter.handle({
      queryStringParameters: {
        sortOrder: 'asc',
      } as unknown,
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
  });

  it('should return a response with status code 400 if the sortOrder is invalid', async () => {
    const { adapter } = setup();

    const response = await adapter.handle({
      queryStringParameters: {
        sortOrder: 'invalid',
      } as unknown,
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
  });

  it('should return a response with status code 400 if the sortBy is invalid', async () => {
    const { adapter } = setup();

    const response = await adapter.handle({
      queryStringParameters: {
        sortBy: 'invalid',
      } as unknown,
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
  });
});

const setup = () => {
  const useCase = {
    listEvents: jest.fn(),
  };

  const sampleEvent = EventMother.basic().build();

  return {
    adapter: new ListEventsAdapter({
      useCase,
    }),
    useCase,
    sampleEvent,
  };
};
