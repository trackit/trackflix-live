import { mockClient } from 'aws-sdk-client-mock';
import {
  MediaPackageClient,
  CreateChannelCommand,
  CreateOriginEndpointCommand,
} from '@aws-sdk/client-mediapackage';
import { MediaPackageChannelsManager } from './MediaPackageChannelsManager';
import { EventMother } from '@trackflix-live/types';

describe('MediaPackage channels manager', () => {
  const mock = mockClient(MediaPackageClient);

  beforeEach(() => {
    mock.reset();
  });

  describe('createChannel', () => {
    it('should create channel', async () => {
      const { mediaPackageChannelsManager } = setup();
      const event = EventMother.basic().build();

      mock
        .on(CreateOriginEndpointCommand)
        .resolvesOnce({
          Url: event.endpoints[0].url,
        })
        .resolvesOnce({
          Url: event.endpoints[1].url,
        });

      await mediaPackageChannelsManager.createChannel(event.id);

      const commandCalls = mock.commandCalls(CreateChannelCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        Id: `TrackflixLiveMPC-${event.id}`,
      });
    });

    it('should create HLS and DASH endpoints', async () => {
      const { mediaPackageChannelsManager } = setup();
      const event = EventMother.basic().build();

      mock
        .on(CreateOriginEndpointCommand)
        .resolvesOnce({
          Url: event.endpoints[0].url,
        })
        .resolvesOnce({
          Url: event.endpoints[1].url,
        });

      await mediaPackageChannelsManager.createChannel(event.id);

      const commandCalls = mock.commandCalls(CreateOriginEndpointCommand);
      expect(commandCalls).toHaveLength(2);
      expect(commandCalls[0].args[0].input).toEqual({
        ChannelId: `TrackflixLiveMPC-${event.id}`,
        Id: `TrackflixLiveMPOE-HLS-${event.id}`,
        HlsPackage: {
          PlaylistType: 'EVENT',
        },
      });
      expect(commandCalls[1].args[0].input).toEqual({
        ChannelId: `TrackflixLiveMPC-${event.id}`,
        Id: `TrackflixLiveMPOE-DASH-${event.id}`,
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
