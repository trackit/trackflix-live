import {
  CreatePackageChannelResponse,
  PackageChannelsManager,
} from '@trackflix-live/api-events';
import {
  CreateChannelCommand,
  CreateOriginEndpointCommand,
  DeleteChannelCommand,
  DeleteOriginEndpointCommand,
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
    const mainChannelId = `TrackflixLiveMPC-${eventId}`;
    const verticalChannelId = `TrackflixLiveMPC-Vert-${eventId}`;

    // Create Main Channel
    await this.client.send(
      new CreateChannelCommand({
        Id: mainChannelId,
      })
    );

    const hlsMain = await this.client.send(
      new CreateOriginEndpointCommand({
        ChannelId: mainChannelId,
        Id: `TrackflixLiveMPOE-HLS-${eventId}`,
        HlsPackage: {
          PlaylistType: 'EVENT',
          SegmentDurationSeconds: 3,
        },
      })
    );

    const dashMain = await this.client.send(
      new CreateOriginEndpointCommand({
        ChannelId: mainChannelId,
        Id: `TrackflixLiveMPOE-DASH-${eventId}`,
        DashPackage: {},
      })
    );

    // Create Vertical Channel
    await this.client.send(
      new CreateChannelCommand({
        Id: verticalChannelId,
      })
    );

    const hlsVert = await this.client.send(
      new CreateOriginEndpointCommand({
        ChannelId: verticalChannelId,
        Id: `TrackflixLiveMPOE-HLS-Vert-${eventId}`,
        HlsPackage: {
          PlaylistType: 'EVENT',
          SegmentDurationSeconds: 3,
        },
      })
    );

    if (!hlsMain.Url || !dashMain.Url || !hlsVert.Url) {
      throw new Error('Failed to create MediaPackage endpoints');
    }

    return {
      mainChannelId,
      verticalChannelId,
      endpoints: [
        {
          url: hlsMain.Url,
          type: EndpointType.HLS,
          orientation: 'HORIZONTAL',
        },
        {
          url: dashMain.Url,
          type: EndpointType.DASH,
          orientation: 'HORIZONTAL',
        },
        {
          url: hlsVert.Url,
          type: EndpointType.HLS,
          orientation: 'VERTICAL',
        },
      ],
    };
  }

  public async deleteChannel(eventId: string): Promise<void> {
    const mainChannelId = `TrackflixLiveMPC-${eventId}`;
    const verticalChannelId = `TrackflixLiveMPC-Vert-${eventId}`;

    // Delete Main Channel resources
    await this.client.send(
      new DeleteOriginEndpointCommand({
        Id: `TrackflixLiveMPOE-DASH-${eventId}`,
      })
    );
    await this.client.send(
      new DeleteOriginEndpointCommand({
        Id: `TrackflixLiveMPOE-HLS-${eventId}`,
      })
    );
    await this.client.send(
      new DeleteChannelCommand({
        Id: mainChannelId,
      })
    );

    // Delete Vertical Channel resources
    await this.client.send(
      new DeleteOriginEndpointCommand({
        Id: `TrackflixLiveMPOE-HLS-Vert-${eventId}`,
      })
    );
    await this.client.send(
      new DeleteChannelCommand({
        Id: verticalChannelId,
      })
    );
  }
}
