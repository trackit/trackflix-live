import { MediaLiveClient } from '@aws-sdk/client-medialive';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { StartMediaLiveChannelAdapter } from './startMediaLiveChannel.adapter';
import { StartLiveChannelUseCaseImpl } from '@trackflix-live/api-events';
import { TaskTokensDynamoDBRepository } from '../../infrastructure/TaskTokensDynamoDBRepository';
import { MediaLiveChannelsManager } from '../../infrastructure/MediaLiveChannelsManager';
import { EventsIotUpdateSender } from '../../infrastructure/EventsIotUpdateSender';
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane';
import { EventsDynamoDBRepository } from '../../infrastructure/EventsDynamoDBRepository';

const dynamoDbClient = new DynamoDBClient();
const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

const taskTokensRepository = new TaskTokensDynamoDBRepository({
  client: documentClient,
  tableName: process.env.TASK_TOKENS_TABLE!,
});

const mediaLiveClient = new MediaLiveClient({});
const liveChannelsManager = new MediaLiveChannelsManager({
  client: mediaLiveClient,
  mediaLiveRoleArn: process.env.MEDIA_LIVE_ROLE!,
});

const eventUpdateSender = new EventsIotUpdateSender(
  new IoTDataPlaneClient({}),
  process.env.IOT_TOPIC || ''
);

const eventsRepository = new EventsDynamoDBRepository(
  new DynamoDBClient({}),
  process.env.EVENTS_TABLE || ''
);

const useCase = new StartLiveChannelUseCaseImpl({
  taskTokensRepository,
  liveChannelsManager,
  eventUpdateSender,
  eventsRepository,
});

const adapter = new StartMediaLiveChannelAdapter({
  useCase,
});

export const main = async (params: {
  input: {
    eventId: string;
    packageChannelId: string;
    liveChannelId: string;
    liveChannelArn: string;
  };
  taskToken: string;
}): Promise<{
  eventId: string;
  packageChannelId: string;
  liveChannelId: string;
  liveChannelArn: string;
}> => adapter.handle(params);
