import { CreateEventAdapter } from './createEvent.adapter';
import { APIGatewayProxyEventV2WithRequestContext } from 'aws-lambda';
import { EventMother } from '@trackflix-live/types';
import {
  AssetNotFoundError,
  CreateEventMother,
  tokenCreateEventUseCase,
} from '@trackflix-live/api-events';
import { register, reset } from '@trackflix-live/di';
import { CustomRequestContext } from '../types';

describe('Create event adapter', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-03-05T10:00:00.000Z'));

  it('should call use case', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .build();

    await adapter.handle({
      body: JSON.stringify(createEventReq),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(useCase.createEvent).toHaveBeenCalledWith(createEventReq);
  });

  it('should return successful response', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .build();
    const event = EventMother.basic().build();
    useCase.createEvent.mockImplementationOnce(() => event);

    const response = await adapter.handle({
      body: JSON.stringify(createEventReq),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({ event });
  });

  it('should return 400 response if no body is provided', async () => {
    const { adapter } = setup();
    const response = await adapter.handle({
      body: undefined,
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
      description: 'No body received.',
    });
  });

  it('should return 400 response if body is not json', async () => {
    const { adapter } = setup();
    const response = await adapter.handle({
      body: 'invalid json',
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
      description: 'Body is not valid JSON.',
    });
  });

  it('should return 400 response if body does not match schema', async () => {
    const { adapter } = setup();
    const response = await adapter.handle({
      body: JSON.stringify({
        unknownField: 'unknownValue',
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
      description: 'Body does not match schema.',
    });
  });

  it('should return 400 response if start date is after end date', async () => {
    const { adapter } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-15T16:00:00.000Z')
      .withOnAirEndTime('2025-03-15T15:00:00.000Z')
      .build();

    const response = await adapter.handle({
      body: JSON.stringify(createEventReq),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
      description: 'Start time should be before end time.',
    });
  });

  it('should return 400 response if start date is in the past', async () => {
    const { adapter } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-05T05:00:00.000Z')
      .build();

    const response = await adapter.handle({
      body: JSON.stringify(createEventReq),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
      description: 'Start time should be at least 6 minutes in the future.',
    });
  });

  it('should return 400 response if start date is not at least 6 minutes in the future', async () => {
    const { adapter } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-05T10:02:00.000Z')
      .build();

    const response = await adapter.handle({
      body: JSON.stringify(createEventReq),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
      description: 'Start time should be at least 6 minutes in the future.',
    });
  });

  it('should return 400 response if start date is more than 364 days in the future', async () => {
    const { adapter } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2026-03-05T10:00:00.000Z')
      .build();

    const response = await adapter.handle({
      body: JSON.stringify(createEventReq),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
      description: 'Start time should be at most 364 days in the future.',
    });
  });

  it('should return 400 response if source is not an S3 URI of an MP4', async () => {
    const { adapter } = setup();

    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .withSource('s3://test.mp3')
      .build();

    const response = await adapter.handle({
      body: JSON.stringify(createEventReq),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
      description: 'Body does not match schema.',
    });
  });

  it('should return 400 response if use case throws an AssetNotFoundError', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .build();
    useCase.createEvent.mockRejectedValue(new AssetNotFoundError());

    const response = await adapter.handle({
      body: JSON.stringify(createEventReq),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
      description: 'Asset not found.',
    });
  });

  it('should return 403 response if user is not in Creators group', async () => {
    const { adapter } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .build();

    const response = await adapter.handle({
      body: JSON.stringify(createEventReq),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Viewers'],
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(403);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Forbidden',
      description: 'Viewers are not authorized to create events',
    });
  });

  it('should return 403 response if cognito:groups is a string and not Creators', async () => {
    const { adapter } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .build();

    const response = await adapter.handle({
      body: JSON.stringify(createEventReq),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': 'Viewers',
          },
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(403);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Forbidden',
      description: 'Viewers are not authorized to create events',
    });
  });

  it('should return 403 response if cognito:groups does not exist', async () => {
    const { adapter } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .build();

    const response = await adapter.handle({
      body: JSON.stringify(createEventReq),
      requestContext: {
        authorizer: {
          claims: {},
        },
      } as any,
    } as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(403);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Forbidden',
      description: 'Viewers are not authorized to create events',
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    createEvent: jest.fn(),
  };
  register(tokenCreateEventUseCase, { useValue: useCase });

  return {
    adapter: new CreateEventAdapter(),
    useCase,
  };
};
