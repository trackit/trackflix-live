import { DeleteMediaPackageChannelAdapter } from './deleteMediaPackageChannel.adapter';
import { DeletePackageChannelUseCaseImpl } from '@trackflix-live/api-events';
import { MediaPackageClient } from '@aws-sdk/client-mediapackage';
import { MediaPackageChannelsManager } from '../../infrastructure/MediaPackageChannelsManager';

const mediaPackageClient = new MediaPackageClient({});
const packageChannelsManager = new MediaPackageChannelsManager({
  client: mediaPackageClient,
});

const useCase = new DeletePackageChannelUseCaseImpl({
  packageChannelsManager,
});

const adapter = new DeleteMediaPackageChannelAdapter({
  useCase,
});

export const main = async (params: {
  eventId: string;
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
