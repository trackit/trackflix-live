import { MediaLiveClient } from '@aws-sdk/client-medialive';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DeleteMediaLiveInputAdapter } from './deleteMediaLiveInput.adapter';
import { DeleteLiveInputUseCaseImpl } from '@trackflix-live/api-events';
import { MediaLiveChannelsManager } from '../../infrastructure/MediaLiveChannelsManager';
import { EventsDynamoDBRepository } from '../../infrastructure/EventsDynamoDBRepository';
import { EventsIotUpdateSender } from '../../infrastructure/EventsIotUpdateSender';
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane';
import { IoTClient } from '@aws-sdk/client-iot';

const dynamoDbClient = new DynamoDBClient();
const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

const eventsRepository = new EventsDynamoDBRepository(
  documentClient,
  process.env.EVENTS_TABLE!
);

const mediaLiveClient = new MediaLiveClient({});
const liveChannelsManager = new MediaLiveChannelsManager({
  client: mediaLiveClient,
  mediaLiveRoleArn: process.env.MEDIA_LIVE_ROLE!,
});

const eventUpdateSender = new EventsIotUpdateSender({
  dataPlaneClient: new IoTDataPlaneClient({}),
  client: new IoTClient(),
  iotTopicName: process.env.IOT_TOPIC || '',
  iotPolicy: process.env.IOT_POLICY || '',
});

const useCase = new DeleteLiveInputUseCaseImpl({
  liveChannelsManager,
  eventsRepository,
  eventUpdateSender,
});

const adapter = new DeleteMediaLiveInputAdapter({
  useCase,
});

export const main = async (params: {
  eventId: string;
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
