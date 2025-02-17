import { CreateEventAdapter } from './createEvent.adapter';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

describe('Create event adapter', () => {
  it('should call use case', async () => {
    const { adapter, useCase } = setup();

    await adapter.handle({
      body: JSON.stringify({
        name: 'First event',
        description: 'This is my first event.',
        onAirStartTime: '2025-02-04T15:15:31.606Z',
        onAirEndTime: '2025-02-04T16:21:50.292Z',
        source: {
          bucket: 'test',
          key: 'test',
        },
      }),
    } as APIGatewayProxyEventV2);

    expect(useCase.createEvent).toHaveBeenCalledWith({
      name: 'First event',
      description: 'This is my first event.',
      onAirStartTime: new Date('2025-02-04T15:15:31.606Z'),
      onAirEndTime: new Date('2025-02-04T16:21:50.292Z'),
      source: {
        bucket: 'test',
        key: 'test',
      },
    });
  });

  it('should return successful response', async () => {
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
    useCase.createEvent.mockImplementationOnce(() => event);

    const response = await adapter.handle({
      body: JSON.stringify({
        name: 'First event',
        description: 'This is my first event.',
        onAirStartTime: '2025-02-04T15:15:31.606Z',
        onAirEndTime: '2025-02-04T16:21:50.292Z',
        source: {
          bucket: 'test',
          key: 'test',
        },
      }),
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({
      event,
    });
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
  return {
    adapter: new CreateEventAdapter({
      useCase,
    }),
    useCase,
  };
};
