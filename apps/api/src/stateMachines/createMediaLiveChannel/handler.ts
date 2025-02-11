import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CreateMediaLiveChannelAdapter } from './createMediaLiveChannel.adapter';
import { CreateLiveChannelUseCaseImpl } from '@trackflix-live/api-events';
import { EventsDynamoDBRepository } from '../../infrastructure/EventsDynamoDBRepository';
import { TaskTokensDynamoDBRepository } from '../../infrastructure/TaskTokensDynamoDBRepository';
import { MediaLiveClient } from '@aws-sdk/client-medialive';
import { MediaLiveChannelsManager } from '../../infrastructure/MediaLiveChannelsManager';

const dynamoDbClient = new DynamoDBClient();
const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

const eventsRepository = new EventsDynamoDBRepository(
  documentClient,
  process.env.EVENTS_TABLE!
);

const taskTokensRepository = new TaskTokensDynamoDBRepository({
  client: documentClient,
  tableName: process.env.TASK_TOKENS_TABLE!,
});

const mediaLiveClient = new MediaLiveClient({});
const liveChannelsManager = new MediaLiveChannelsManager({
  client: mediaLiveClient,
  mediaLiveRoleArn: process.env.MEDIA_LIVE_ROLE!,
});

const useCase = new CreateLiveChannelUseCaseImpl({
  eventsRepository,
  taskTokensRepository,
  liveChannelsManager,
});

const adapter = new CreateMediaLiveChannelAdapter({
  useCase,
});

export const main = async (params: {
  input: {
    eventId: string;
    mediaPackageChannelId: string;
  };
  taskToken: string;
}): Promise<{
  eventId: string;
  mediaPackageChannelId: string;
  mediaLiveChannelId: string;
  mediaLiveChannelArn: string;
}> => adapter.handle(params);
