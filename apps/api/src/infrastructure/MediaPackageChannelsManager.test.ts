import { mockClient } from 'aws-sdk-client-mock';
import {
  MediaPackageClient,
  CreateChannelCommand,
  CreateOriginEndpointCommand,
} from '@aws-sdk/client-mediapackage';
import { MediaPackageChannelsManager } from './MediaPackageChannelsManager';
import { EndpointType, EventEndpoint } from '@trackflix-live/types';

describe('MediaPackage channels manager', () => {
  const mock = mockClient(MediaPackageClient);

  beforeEach(() => {
    mock.reset();
  });

  describe('createChannel', () => {
    it('should create channel', async () => {
      const { mediaPackageChannelsManager } = setup();
      const eventId = '5e9019f4-b937-465c-ab7c-baeb74eb26a2';
      const endpoints: EventEndpoint[] = [
        {
          url: 'https://formula-1.com/live/monaco-gp-2025.m3u8',
          type: EndpointType.HLS,
        },
        {
          url: 'https://formula-1.com/live/monaco-gp-2025.mpd',
          type: EndpointType.DASH,
        },
      ];

      mock
        .on(CreateOriginEndpointCommand)
        .resolvesOnce({
          Url: endpoints[0].url,
        })
        .resolvesOnce({
          Url: endpoints[1].url,
        });

      await mediaPackageChannelsManager.createChannel(eventId);

      const commandCalls = mock.commandCalls(CreateChannelCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        Id: `TrackflixLiveMPC-${eventId}`,
      });
    });

    it('should create HLS and DASH endpoints', async () => {
      const { mediaPackageChannelsManager } = setup();
      const eventId = '5e9019f4-b937-465c-ab7c-baeb74eb26a2';
      const endpoints: EventEndpoint[] = [
        {
          url: 'https://formula-1.com/live/monaco-gp-2025.m3u8',
          type: EndpointType.HLS,
        },
        {
          url: 'https://formula-1.com/live/monaco-gp-2025.mpd',
          type: EndpointType.DASH,
        },
      ];

      mock
        .on(CreateOriginEndpointCommand)
        .resolvesOnce({
          Url: endpoints[0].url,
        })
        .resolvesOnce({
          Url: endpoints[1].url,
        });

      await mediaPackageChannelsManager.createChannel(eventId);

      const commandCalls = mock.commandCalls(CreateOriginEndpointCommand);
      expect(commandCalls).toHaveLength(2);
      expect(commandCalls[0].args[0].input).toEqual({
        ChannelId: `TrackflixLiveMPC-${eventId}`,
        Id: `TrackflixLiveMPOE-HLS-${eventId}`,
        HlsPackage: {
          PlaylistType: 'EVENT',
        },
      });
      expect(commandCalls[1].args[0].input).toEqual({
        ChannelId: `TrackflixLiveMPC-${eventId}`,
        Id: `TrackflixLiveMPOE-DASH-${eventId}`,
        DashPackage: {},
      });
    });
  });
});

const setup = () => {
  const client = new MediaPackageClient({
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
  const mediaPackageChannelsManager = new MediaPackageChannelsManager({
    client,
  });

  return { client, mediaPackageChannelsManager };
};
