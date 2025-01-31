import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { CreateEventAdapter } from './createEvent.adapter';
import {
  CreateEventUseCaseImpl,
} from '@trackflix-live/api-events';
import { EventBridgeScheduler } from "../../infrastructure/EventBridgeScheduler";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { EventsDynamoDBRepository } from "../../infrastructure/EventsDynamoDBRepository";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const eventScheduler = new EventBridgeScheduler(new EventBridgeClient({}));
const eventsRepository = new EventsDynamoDBRepository(new DynamoDBClient(({})), process.env.TABLE_NAME || '');

const useCase = new CreateEventUseCaseImpl({
  eventScheduler,
  eventsRepository,
});

const adapter = new CreateEventAdapter({
  useCase,
});

export const main = (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => adapter.handle(event);
