import { MediaLiveClient } from '@aws-sdk/client-medialive';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DeleteMediaLiveChannelAdapter } from './deleteMediaLiveChannel.adapter';
import { DeleteLiveChannelUseCaseImpl } from '@trackflix-live/api-events';
import { TaskTokensDynamoDBRepository } from '../../infrastructure/TaskTokensDynamoDBRepository';
import { MediaLiveChannelsManager } from '../../infrastructure/MediaLiveChannelsManager';
import { EventsDynamoDBRepository } from '../../infrastructure/EventsDynamoDBRepository';

const dynamoDbClient = new DynamoDBClient();
const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

const taskTokensRepository = new TaskTokensDynamoDBRepository({
  client: documentClient,
  tableName: process.env.TASK_TOKENS_TABLE!,
});
const eventsRepository = new EventsDynamoDBRepository(
  documentClient,
  process.env.EVENTS_TABLE!
);

const mediaLiveClient = new MediaLiveClient({});
const liveChannelsManager = new MediaLiveChannelsManager({
  client: mediaLiveClient,
  mediaLiveRoleArn: process.env.MEDIA_LIVE_ROLE!,
});

const useCase = new DeleteLiveChannelUseCaseImpl({
  taskTokensRepository,
  liveChannelsManager,
  eventsRepository,
});

const adapter = new DeleteMediaLiveChannelAdapter({
  useCase,
});

export const main = async (params: {
  input: {
    eventId: string;
  };
  taskToken: string;
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
