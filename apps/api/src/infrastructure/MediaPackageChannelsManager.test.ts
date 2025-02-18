import { mockClient } from 'aws-sdk-client-mock';
import {
  MediaPackageClient,
  CreateChannelCommand,
  CreateOriginEndpointCommand,
} from '@aws-sdk/client-mediapackage';
import { MediaPackageChannelsManager } from './MediaPackageChannelsManager';

describe('MediaPackage channels manager', () => {
  const mock = mockClient(MediaPackageClient);

  beforeEach(() => {
    mock.reset();
  });

  describe('createChannel', () => {
    it('should create channel', async () => {
      const { mediaPackageChannelsManager } = setup();
      const eventId = 'dbb682ee-1dd6-4ec6-a666-03b04ace1f9d';

      await mediaPackageChannelsManager.createChannel(eventId);

      const commandCalls = mock.commandCalls(CreateChannelCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        Id: 'TrackflixLiveMPC-dbb682ee-1dd6-4ec6-a666-03b04ace1f9d',
      });
    });

    it('should create HLS and DASH endpoints', async () => {
      const { mediaPackageChannelsManager } = setup();
      const eventId = 'dbb682ee-1dd6-4ec6-a666-03b04ace1f9d';

      await mediaPackageChannelsManager.createChannel(eventId);

      const commandCalls = mock.commandCalls(CreateOriginEndpointCommand);
      expect(commandCalls).toHaveLength(2);
      expect(commandCalls[0].args[0].input).toEqual({
        ChannelId: 'TrackflixLiveMPC-dbb682ee-1dd6-4ec6-a666-03b04ace1f9d',
        Id: 'TrackflixLiveMPOE-HLS-dbb682ee-1dd6-4ec6-a666-03b04ace1f9d',
        HlsPackage: {
          PlaylistType: 'EVENT',
        },
      });
      expect(commandCalls[1].args[0].input).toEqual({
        ChannelId: 'TrackflixLiveMPC-dbb682ee-1dd6-4ec6-a666-03b04ace1f9d',
        Id: 'TrackflixLiveMPOE-DASH-dbb682ee-1dd6-4ec6-a666-03b04ace1f9d',
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
