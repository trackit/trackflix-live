import { PackageChannelsManager } from '@trackflix-live/api-events';
import {
  CreateChannelCommand,
  CreateOriginEndpointCommand,
  MediaPackageClient,
} from '@aws-sdk/client-mediapackage';

export class MediaPackageChannelsManager implements PackageChannelsManager {
  private readonly client: MediaPackageClient;

  public constructor({ client }: { client: MediaPackageClient }) {
    this.client = client;
  }

  public async createChannel(eventId: string): Promise<string> {
    const mediaPackageChannelId = `TrackflixLiveMPC-${eventId}`;
    await this.client.send(
      new CreateChannelCommand({
        Id: mediaPackageChannelId,
      })
    );

    await this.client.send(
      new CreateOriginEndpointCommand({
        ChannelId: mediaPackageChannelId,
        Id: `TrackflixLiveMPOE-HLS-${eventId}`,
        HlsPackage: {
          PlaylistType: 'EVENT',
        },
      })
    );
    await this.client.send(
      new CreateOriginEndpointCommand({
        ChannelId: mediaPackageChannelId,
        Id: `TrackflixLiveMPOE-DASH-${eventId}`,
        DashPackage: {},
      })
    );

    return mediaPackageChannelId;
  }
}
