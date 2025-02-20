import {
  CreatePackageChannelResponse,
  PackageChannelsManager,
} from '../ports/PackageChannelsManager';
import { EndpointType } from '@trackflix-live/types';

export class PackageChannelsManagerFake implements PackageChannelsManager {
  private packageChannelId = '8123456';

  public readonly createdChannels: string[] = [];

  public async createChannel(
    eventId: string
  ): Promise<CreatePackageChannelResponse> {
    this.createdChannels.push(eventId);
    return {
      channelId: this.packageChannelId,
      endpoints: [
        {
          url: `https://trackflix-live.mediapackage.com/${eventId}/index.m3u8`,
          type: EndpointType.HLS,
        },
        {
          url: `https://trackflix-live.mediapackage.com/${eventId}/index.mpd`,
          type: EndpointType.DASH,
        },
      ],
    };
  }

  public setPackageChannelId(packageChannelId: string) {
    this.packageChannelId = packageChannelId;
  }
}
