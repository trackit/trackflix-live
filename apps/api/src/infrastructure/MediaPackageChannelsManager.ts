import {
  CreatePackageChannelResponse,
  PackageChannelsManager,
} from '@trackflix-live/api-events';
import {
  CreateChannelCommand,
  CreateOriginEndpointCommand,
  MediaPackageClient,
} from '@aws-sdk/client-mediapackage';
import { EndpointType } from '@trackflix-live/types';

export class MediaPackageChannelsManager implements PackageChannelsManager {
  private readonly client: MediaPackageClient;

  public constructor({ client }: { client: MediaPackageClient }) {
    this.client = client;
  }

  public async createChannel(
    eventId: string
  ): Promise<CreatePackageChannelResponse> {
    const mediaPackageChannelId = `TrackflixLiveMPC-${eventId}`;
    await this.client.send(
      new CreateChannelCommand({
        Id: mediaPackageChannelId,
      })
    );

    const hlsResponse = await this.client.send(
      new CreateOriginEndpointCommand({
        ChannelId: mediaPackageChannelId,
        Id: `TrackflixLiveMPOE-HLS-${eventId}`,
        HlsPackage: {
          PlaylistType: 'EVENT',
        },
      })
    );

    const dashResponse = await this.client.send(
      new CreateOriginEndpointCommand({
        ChannelId: mediaPackageChannelId,
        Id: `TrackflixLiveMPOE-DASH-${eventId}`,
        DashPackage: {},
      })
    );

    console.log(hlsResponse);
    console.log(dashResponse);

    if (!hlsResponse.Url || !dashResponse.Url) {
      throw new Error('Failed to create MediaPackage endpoints');
    }

    return {
      channelId: mediaPackageChannelId,
      endpoints: [
        {
          url: hlsResponse.Url,
          type: EndpointType.HLS,
        },
        {
          url: dashResponse.Url,
          type: EndpointType.DASH,
        },
      ],
    };
  }
}
