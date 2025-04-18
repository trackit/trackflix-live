import { mockClient } from 'aws-sdk-client-mock';
import {
  MediaPackageClient,
  CreateChannelCommand,
  CreateOriginEndpointCommand,
  DeleteChannelCommand,
  DeleteOriginEndpointCommand,
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
          SegmentDurationSeconds: 3,
        },
      });
      expect(commandCalls[1].args[0].input).toEqual({
        ChannelId: `TrackflixLiveMPC-${eventId}`,
        Id: `TrackflixLiveMPOE-DASH-${eventId}`,
        DashPackage: {},
      });
    });
  });

  describe('deleteChannel', () => {
    it('should delete channel', async () => {
      const { mediaPackageChannelsManager } = setup();
      const eventId = 'dbb682ee-1dd6-4ec6-a666-03b04ace1f9d';

      await mediaPackageChannelsManager.deleteChannel(eventId);

      const commandCalls = mock.commandCalls(DeleteChannelCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        Id: 'TrackflixLiveMPC-dbb682ee-1dd6-4ec6-a666-03b04ace1f9d',
      });
    });

    it('should delete HLS and DASH endpoints', async () => {
      const { mediaPackageChannelsManager } = setup();
      const eventId = 'dbb682ee-1dd6-4ec6-a666-03b04ace1f9d';

      await mediaPackageChannelsManager.deleteChannel(eventId);

      const commandCalls = mock.commandCalls(DeleteOriginEndpointCommand);
      expect(commandCalls).toHaveLength(2);
      expect(commandCalls[0].args[0].input).toEqual({
        Id: 'TrackflixLiveMPOE-DASH-dbb682ee-1dd6-4ec6-a666-03b04ace1f9d',
      });
      expect(commandCalls[1].args[0].input).toEqual({
        Id: 'TrackflixLiveMPOE-HLS-dbb682ee-1dd6-4ec6-a666-03b04ace1f9d',
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
