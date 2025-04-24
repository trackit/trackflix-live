import { CreateEventAdapter } from './createEvent.adapter';
import { APIGatewayProxyEventV2WithRequestContext } from 'aws-lambda';
import { EventMother, InputNetworkLocation } from '@trackflix-live/types';
import {
  AssetNotFoundError,
  AuthorizationError,
  CreateEventMother,
  tokenCreateEventUseCase,
} from '@trackflix-live/api-events';
import { register, reset } from '@trackflix-live/di';
import { CustomRequestContext } from '../types';
import { InputType } from '@aws-sdk/client-medialive';

describe('Create event adapter', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-03-05T10:00:00.000Z'));

  it('should call use case', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .build();

    await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(useCase.createEvent).toHaveBeenCalledWith(createEventReq);
  });

  it('should return successful response for MP4_FILE', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .build();
    const event = EventMother.basic().build();
    useCase.createEvent.mockImplementationOnce(() => event);

    const response = await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({ event });
  });

  it('should return successful response for TS_FILE', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .withSource('s3://test.ts')
      .withInputType(InputType.TS_FILE)
      .build();
    const event = EventMother.basic().build();
    useCase.createEvent.mockImplementationOnce(() => event);

    const response = await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({ event });
  });

  it('should return successful response for URL_PULL', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .withSource('https://test.m3u8')
      .withInputType(InputType.URL_PULL)
      .build();
    const event = EventMother.basic().build();
    useCase.createEvent.mockImplementationOnce(() => event);

    const response = await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({ event });
  });

  it('should return successful response for MEDIACONNECT', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .withSource({
        flowArn:
          'arn:aws:mediaconnect:us-west-2:123456789123:flow:test:trackflix-live-test',
        roleArn: 'arn:aws:iam::123456789123:role/MediaLiveAccessRole',
      })
      .withInputType(InputType.MEDIACONNECT)
      .build();
    const event = EventMother.basic().build();
    useCase.createEvent.mockImplementationOnce(() => event);

    const response = await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({ event });
  });

  it('should return successful response for RTP', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .withSource({
        flowArn:
          'arn:aws:mediaconnect:us-west-2:123456789123:flow:test:trackflix-live-test',
        roleArn: 'arn:aws:iam::123456789123:role/MediaLiveAccessRole',
      })
      .withInputType(InputType.RTP_PUSH)
      .withSource({
        inputNetworkLocation: InputNetworkLocation.AWS,
        inputSecurityGroups: '1234567',
      })
      .build();
    const event = EventMother.basic().build();
    useCase.createEvent.mockImplementationOnce(() => event);

    const response = await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({ event });
  });

  it('should return successful response for SRT_CALLER', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .withSource({
        flowArn:
          'arn:aws:mediaconnect:us-west-2:123456789123:flow:test:trackflix-live-test',
        roleArn: 'arn:aws:iam::123456789123:role/MediaLiveAccessRole',
      })
      .withInputType(InputType.SRT_CALLER)
      .withSource({
        streamId: 'id',
        srtListenerPort: '2000',
        srtListenerAddress: '82.66.192.191',
        minimumLatency: 2000,
      })
      .build();
    const event = EventMother.basic().build();
    useCase.createEvent.mockImplementationOnce(() => event);

    const response = await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({ event });
  });

  it('should return successful response for RTMP_PULL', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .withSource({
        url: 'rtmp://example.com/live/test',
      })
      .withInputType(InputType.RTMP_PULL)
      .build();
    const event = EventMother.basic().build();
    useCase.createEvent.mockImplementationOnce(() => event);

    const response = await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({ event });
  });

  it('should return successful response for RTMP_PUSH', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .withSource({
        inputNetworkLocation: InputNetworkLocation.AWS,
        inputSecurityGroups: '1234567',
        streamName: 'test/test',
      })
      .withInputType(InputType.RTMP_PUSH)
      .build();
    const event = EventMother.basic().build();
    useCase.createEvent.mockImplementationOnce(() => event);

    const response = await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

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
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

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
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

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
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

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
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

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
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

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
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

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
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

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
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
      description: 'Body does not match schema.',
    });
  });

  it('should return 400 response if source is not an S3 URI of an TS_FILE', async () => {
    const { adapter } = setup();

    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .withInputType(InputType.TS_FILE)
      .withSource('s3://test.js')
      .build();

    const response = await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
      description: 'Body does not match schema.',
    });
  });

  it('should return 400 response if source is not an HLS url', async () => {
    const { adapter } = setup();

    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .withInputType(InputType.URL_PULL)
      .withSource('https://s3://test.mp4')
      .build();

    const response = await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

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
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
      description: 'Asset not found.',
    });
  });

  it('should return 403 response if use case throws an AuthorizationError', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .build();
    useCase.createEvent.mockRejectedValue(new AuthorizationError());

    const response = await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Viewers'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(403);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Forbidden',
      description: 'You are not authorized to perform this action.',
    });
  });

  it('should handle cognito:groups as a string', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .withUserGroups(['Viewers'])
      .build();
    useCase.createEvent.mockResolvedValue({});

    await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': 'Viewers',
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(useCase.createEvent).toHaveBeenCalledWith(createEventReq);
  });

  it('should handle empty cognito:groups', async () => {
    const { adapter, useCase } = setup();
    const createEventReq = CreateEventMother.basic()
      .withOnAirStartTime('2025-03-10T10:00:00.000Z')
      .build();
    useCase.createEvent.mockRejectedValue(new AuthorizationError());

    await adapter.handle({
      body: JSON.stringify({
        name: createEventReq.name,
        description: createEventReq.description,
        onAirStartTime: createEventReq.onAirStartTime,
        onAirEndTime: createEventReq.onAirEndTime,
        source: createEventReq.source,
        inputType: createEventReq.inputType,
      }),
      requestContext: {
        authorizer: {
          claims: {},
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(useCase.createEvent).toHaveBeenCalledWith({
      ...createEventReq,
      userGroups: [],
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
