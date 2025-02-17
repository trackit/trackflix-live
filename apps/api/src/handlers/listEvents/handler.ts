import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ListEventsAdapter } from './listEvents.adapter';
import { EventsDynamoDBRepository } from '../../infrastructure/EventsDynamoDBRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ListEventsUseCaseImpl } from '@trackflix-live/api-events';

const eventsRepository = new EventsDynamoDBRepository(
  new DynamoDBClient({}),
  process.env.TABLE_NAME || ''
);

const useCase = new ListEventsUseCaseImpl({
  eventsRepository,
});

const adapter = new ListEventsAdapter({
  useCase,
});

export const main = (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => adapter.handle(event);
