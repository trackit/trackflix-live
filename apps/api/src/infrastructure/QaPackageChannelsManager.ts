import {
  CreatePackageChannelResponse,
  PackageChannelsManager,
} from '@trackflix-live/api-events';
import { EndpointType } from '@trackflix-live/types';

export class QaPackageChannelsManager implements PackageChannelsManager {
  public async createChannel(
    eventId: string
  ): Promise<CreatePackageChannelResponse> {
    console.log('createChannel', JSON.stringify(eventId, null, 2));
    return {
      channelId: 'MOCK_PACKAGE_CHANNEL_ID',
      endpoints: [
        {
          type: EndpointType.HLS,
          url: 'MOCK_HLS_ENDPOINT',
        },
        {
          type: EndpointType.DASH,
          url: 'MOCK_DASH_ENDPOINT',
        },
      ],
    };
  }

  public async deleteChannel(channelId: string): Promise<void> {
    console.log('deleteChannel', JSON.stringify(channelId, null, 2));
    return Promise.resolve(undefined);
  }
}
