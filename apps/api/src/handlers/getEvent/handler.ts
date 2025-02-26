import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetEventAdapter } from './getEvent.adapter';
import { GetEventUseCaseImpl } from '@trackflix-live/api-events';
import { EventsDynamoDBRepository } from '../../infrastructure/EventsDynamoDBRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const eventsRepository = new EventsDynamoDBRepository(
  new DynamoDBClient({}),
  process.env.EVENTS_TABLE || ''
);

const useCase = new GetEventUseCaseImpl({
  eventsRepository,
});

const adapter = new GetEventAdapter({
  useCase,
});

export const main = (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => adapter.handle(event);
