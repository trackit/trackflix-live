import { MediaPackageClient } from '@aws-sdk/client-mediapackage';
import { MediaPackageChannelsManager } from '../../infrastructure/MediaPackageChannelsManager';
import { CreatePackageChannelUseCaseImpl } from '@trackflix-live/api-events';
import { CreateMediaPackageChannelAdapter } from './createMediaPackageChannel.adapter';
import { EventsDynamoDBRepository } from '../../infrastructure/EventsDynamoDBRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { EventsIotUpdateSender } from '../../infrastructure/EventsIotUpdateSender';
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane';

const mediaPackageClient = new MediaPackageClient();

const packageChannelsManager = new MediaPackageChannelsManager({
  client: mediaPackageClient,
});

const eventsRepository = new EventsDynamoDBRepository(
  new DynamoDBClient({}),
  process.env.EVENTS_TABLE || ''
);

const eventUpdateSender = new EventsIotUpdateSender(
  new IoTDataPlaneClient({}),
  process.env.IOT_TOPIC || ''
);

const useCase = new CreatePackageChannelUseCaseImpl({
  packageChannelsManager,
  eventsRepository,
  eventUpdateSender,
});

const adapter = new CreateMediaPackageChannelAdapter({
  useCase,
});

export const main = async (event: {
  eventId: string;
}): Promise<{ eventId: string; packageChannelId: string }> =>
  adapter.handle(event);
