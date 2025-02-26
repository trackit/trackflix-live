import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SaveResultsAdapter } from './saveResults.adapter';
import { SaveResultsUseCaseImpl } from '@trackflix-live/api-events';
import { EventsIotUpdateSender } from '../../infrastructure/EventsIotUpdateSender';
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane';
import { EventsDynamoDBRepository } from '../../infrastructure/EventsDynamoDBRepository';
import { IoTClient } from '@aws-sdk/client-iot';

const eventUpdateSender = new EventsIotUpdateSender({
  dataPlaneClient: new IoTDataPlaneClient({}),
  client: new IoTClient(),
  iotTopicName: process.env.IOT_TOPIC || '',
  iotPolicy: process.env.IOT_POLICY || '',
});

const eventsRepository = new EventsDynamoDBRepository(
  new DynamoDBClient({}),
  process.env.EVENTS_TABLE || ''
);

const useCase = new SaveResultsUseCaseImpl({
  eventUpdateSender,
  eventsRepository,
});

const adapter = new SaveResultsAdapter({
  useCase,
});

export const main = async (event: { eventId: string }): Promise<void> =>
  adapter.handle(event);
