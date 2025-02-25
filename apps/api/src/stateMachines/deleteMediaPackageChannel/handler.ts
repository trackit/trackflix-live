import { DeleteMediaPackageChannelAdapter } from './deleteMediaPackageChannel.adapter';
import { DeletePackageChannelUseCaseImpl } from '@trackflix-live/api-events';
import { MediaPackageClient } from '@aws-sdk/client-mediapackage';
import { MediaPackageChannelsManager } from '../../infrastructure/MediaPackageChannelsManager';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { EventsDynamoDBRepository } from '../../infrastructure/EventsDynamoDBRepository';
import { EventsIotUpdateSender } from '../../infrastructure/EventsIotUpdateSender';
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane';
import { IoTClient } from '@aws-sdk/client-iot';

const mediaPackageClient = new MediaPackageClient({});
const packageChannelsManager = new MediaPackageChannelsManager({
  client: mediaPackageClient,
});

const dynamoDbClient = new DynamoDBClient();
const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

const eventsRepository = new EventsDynamoDBRepository(
  documentClient,
  process.env.EVENTS_TABLE!
);

const eventUpdateSender = new EventsIotUpdateSender({
  dataPlaneClient: new IoTDataPlaneClient({}),
  client: new IoTClient(),
  iotTopicName: process.env.IOT_TOPIC || '',
  iotPolicy: process.env.IOT_POLICY || '',
});

const useCase = new DeletePackageChannelUseCaseImpl({
  packageChannelsManager,
  eventsRepository,
  eventUpdateSender,
});

const adapter = new DeleteMediaPackageChannelAdapter({
  useCase,
});

export const main = async (params: {
  eventId: string;
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
