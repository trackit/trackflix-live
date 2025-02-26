import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { CreateEventAdapter } from './createEvent.adapter';
import { CreateEventUseCaseImpl } from '@trackflix-live/api-events';
import { EventBridgeScheduler } from '../../infrastructure/EventBridgeScheduler';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { EventsDynamoDBRepository } from '../../infrastructure/EventsDynamoDBRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { EventsIotUpdateSender } from '../../infrastructure/EventsIotUpdateSender';
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane';
import { IoTClient } from '@aws-sdk/client-iot';

const eventBridgeClient = new EventBridgeClient({});
const eventSchedulerStart = new EventBridgeScheduler({
  client: eventBridgeClient,
  target: process.env.START_TX_LAMBDA || '',
});
const eventSchedulerStop = new EventBridgeScheduler({
  client: eventBridgeClient,
  target: process.env.STOP_TX_LAMBDA || '',
});

const eventsRepository = new EventsDynamoDBRepository(
  new DynamoDBClient({}),
  process.env.EVENTS_TABLE || ''
);
const eventUpdateSender = new EventsIotUpdateSender({
  dataPlaneClient: new IoTDataPlaneClient({}),
  client: new IoTClient(),
  iotTopicName: process.env.IOT_TOPIC || '',
  iotPolicy: process.env.IOT_POLICY || '',
});

const useCase = new CreateEventUseCaseImpl({
  eventSchedulerStart,
  eventSchedulerStop,
  eventsRepository,
  eventUpdateSender,
});

const adapter = new CreateEventAdapter({
  useCase,
});

export const main = (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => adapter.handle(event);
