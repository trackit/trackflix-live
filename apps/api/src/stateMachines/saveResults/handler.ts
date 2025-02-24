import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SaveResultsAdapter } from './saveResults.adapter';
import { SaveResultsUseCaseImpl } from '@trackflix-live/api-events';
import { EventsIotUpdateSender } from '../../infrastructure/EventsIotUpdateSender';
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane';
import { EventsDynamoDBRepository } from '../../infrastructure/EventsDynamoDBRepository';

const eventUpdateSender = new EventsIotUpdateSender(
  new IoTDataPlaneClient({}),
  process.env.IOT_TOPIC || ''
);

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
