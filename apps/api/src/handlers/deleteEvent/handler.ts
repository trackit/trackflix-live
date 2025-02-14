import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DeleteEventAdapter } from './deleteEvent.adapter';
import { DeleteEventUseCaseImpl } from '@trackflix-live/api-events';
import { EventsDynamoDBRepository } from '../../infrastructure/EventsDynamoDBRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const eventsRepository = new EventsDynamoDBRepository(
  new DynamoDBClient({}),
  process.env.TABLE_NAME || ''
);

const useCase = new DeleteEventUseCaseImpl({
  eventsRepository,
});

const adapter = new DeleteEventAdapter({
  useCase,
});

export const main = (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => adapter.handle(event);
