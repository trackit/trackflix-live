import { DeleteEventAdapter } from './deleteEvent.adapter';
import { APIGatewayProxyEventV2WithRequestContext } from 'aws-lambda';
import { NotFoundError } from '../HttpErrors';
import { register, reset } from '@trackflix-live/di';
import {
  AuthorizationError,
  EventCannotBeDeletedIfNotOnPreTxError,
  EventCannotBeDeletedWhileOnAirError,
  tokenDeleteEventUseCase,
} from '@trackflix-live/api-events';
import { CustomRequestContext } from '../types';

describe('Delete Event adapter', () => {
  it('should call use case', async () => {
    const { adapter, useCase } = setup();

    await adapter.handle({
      pathParameters: {
        eventId: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      } as unknown,
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(useCase.deleteEvent).toHaveBeenCalledWith({
      eventId: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      userGroups: ['Creators'],
    });
  });

  it('should return successful response', async () => {
    const { adapter, useCase } = setup();
    const response = await adapter.handle({
      pathParameters: {
        eventId: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      } as unknown,
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    useCase.deleteEvent.mockResolvedValueOnce(undefined);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '').status).toEqual('Ok');
  });

  it('should return 404 if the event does not exist', async () => {
    const { adapter, useCase } = setup();
    useCase.deleteEvent.mockRejectedValue(new NotFoundError());

    const response = await adapter.handle({
      pathParameters: {
        eventId: 'invalid-id',
      } as unknown,
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(404);
    expect(JSON.parse(response.body || '').message).toEqual('Not Found');
  });

  it('should return 400 if the event status is not PRE_TX', async () => {
    const { adapter, useCase } = setup();
    useCase.deleteEvent.mockRejectedValue(
      new EventCannotBeDeletedIfNotOnPreTxError()
    );

    const response = await adapter.handle({
      pathParameters: {
        eventId: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      } as unknown,
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toMatchObject({
      message: 'Bad Request',
      description: 'Event cannot be deleted if not on pre tx',
    });
  });

  it('should return 400 if the event is on air', async () => {
    const { adapter, useCase } = setup();
    useCase.deleteEvent.mockRejectedValue(
      new EventCannotBeDeletedWhileOnAirError()
    );

    const response = await adapter.handle({
      pathParameters: {
        eventId: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      } as unknown,
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toMatchObject({
      message: 'Bad Request',
      description: 'Event cannot be deleted while on air',
    });
  });

  it('should return 403 response if use case throws an AuthorizationError', async () => {
    const { adapter, useCase } = setup();
    useCase.deleteEvent.mockRejectedValue(new AuthorizationError());

    const response = await adapter.handle({
      pathParameters: {
        eventId: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      } as unknown,
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
    useCase.deleteEvent.mockResolvedValue(undefined);

    await adapter.handle({
      pathParameters: {
        eventId: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      } as unknown,
      requestContext: {
        authorizer: {
          claims: {
            'cognito:groups': 'Creators',
          },
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(useCase.deleteEvent).toHaveBeenCalledWith({
      eventId: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      userGroups: ['Creators'],
    });
  });

  it('should handle empty cognito:groups', async () => {
    const { adapter, useCase } = setup();
    useCase.deleteEvent.mockRejectedValue(new AuthorizationError());

    const response = await adapter.handle({
      pathParameters: {
        eventId: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      } as unknown,
      requestContext: {
        authorizer: {
          claims: {},
        },
      },
    } as unknown as APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>);

    expect(response.statusCode).toEqual(403);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Forbidden',
      description: 'You are not authorized to perform this action.',
    });
    expect(useCase.deleteEvent).toHaveBeenCalledWith({
      eventId: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      userGroups: [],
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    deleteEvent: jest.fn(),
  };
  register(tokenDeleteEventUseCase, { useValue: useCase });

  return {
    adapter: new DeleteEventAdapter(),
    useCase,
  };
};
