import { MediaPackageClient } from '@aws-sdk/client-mediapackage';
import { MediaPackageChannelsManager } from '../../infrastructure/MediaPackageChannelsManager';
import { CreatePackageChannelUseCaseImpl } from '@trackflix-live/api-events';
import { CreateMediaPackageChannelAdapter } from './createMediaPackageChannel.adapter';

const mediaPackageClient = new MediaPackageClient();

const packageChannelsManager = new MediaPackageChannelsManager({
  client: mediaPackageClient,
});

const useCase = new CreatePackageChannelUseCaseImpl({
  packageChannelsManager,
});

const adapter = new CreateMediaPackageChannelAdapter({
  useCase,
});

export const main = async (event: {
  eventId: string;
}): Promise<{ eventId: string; packageChannelId: string }> =>
  adapter.handle(event);
