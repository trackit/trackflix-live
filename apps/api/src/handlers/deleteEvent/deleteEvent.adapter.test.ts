import { DeleteEventAdapter } from './deleteEvent.adapter';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { NotFoundError } from '../HttpErrors';
import { register, reset } from '@trackflix-live/di';
import {
  EventCannotBeDeletedIfNotOnPreTxError,
  EventCannotBeDeletedWhileOnAirError,
  tokenDeleteEventUseCase,
} from '@trackflix-live/api-events';

describe('Delete Event adapter', () => {
  it('should call use case', async () => {
    const { adapter, useCase } = setup();

    await adapter.handle({
      pathParameters: {
        eventId: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      } as unknown,
    } as APIGatewayProxyEventV2);

    expect(useCase.deleteEvent).toHaveBeenCalledWith(
      'e5b30161-9206-4f4c-a3cc-0dd8cd284aad'
    );
  });

  it('should return successful response', async () => {
    const { adapter, useCase } = setup();
    const response = await adapter.handle({
      pathParameters: {
        eventId: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
      } as unknown,
    } as APIGatewayProxyEventV2);

    useCase.deleteEvent.mockResolvedValueOnce(undefined);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeUndefined();
  });

  it('should return 404 if the event does not exist', async () => {
    const { adapter, useCase } = setup();
    useCase.deleteEvent.mockRejectedValue(new NotFoundError());

    const response = await adapter.handle({
      pathParameters: {
        eventId: 'invalid-id',
      } as unknown,
    } as APIGatewayProxyEventV2);

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
    } as APIGatewayProxyEventV2);

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
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toMatchObject({
      message: 'Bad Request',
      description: 'Event cannot be deleted while on air',
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
