import { mockClient } from 'aws-sdk-client-mock';
import {
  CreateChannelCommand,
  CreateInputCommand,
  MediaLiveClient,
  StartChannelCommand,
  StopChannelCommand,
} from '@aws-sdk/client-medialive';
import { MediaLiveChannelsManager } from './MediaLiveChannelsManager';

describe('MediaLive channels manager', () => {
  const mock = mockClient(MediaLiveClient);

  beforeEach(() => {
    mock.reset();
  });

  describe('createChannel', () => {
    it('should create input', async () => {
      const { mediaLiveChannelsManager } = setup();
      const eventId = 'dbb682ee-1dd6-4ec6-a666-03b04ace1f9d';
      const packageChannelId = '456789';
      const source = 's3://trackflix-live-demo-videos/oss117.mp4';
      const inputId = '9876543';
      const liveChannelArn =
        'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
      const liveChannelId = '8626488';

      mock.on(CreateInputCommand).resolves({
        Input: {
          Id: inputId,
        },
      });
      mock.on(CreateChannelCommand).resolves({
        Channel: {
          Arn: liveChannelArn,
          Id: liveChannelId,
        },
      });

      await mediaLiveChannelsManager.createChannel({
        eventId,
        packageChannelId,
        source,
      });

      const commandCalls = mock.commandCalls(CreateInputCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        Name: expect.stringMatching(/^TrackflixLiveMLI-.*/),
        Sources: [
          {
            Url: source,
          },
        ],
        Type: 'MP4_FILE',
      });
    });

    it('should create channel', async () => {
      const { mediaLiveChannelsManager } = setup();
      const eventId = 'dbb682ee-1dd6-4ec6-a666-03b04ace1f9d';
      const packageChannelId = '456789';
      const source = 's3://trackflix-live-demo-videos/oss117.mp4';
      const inputId = '9876543';
      const liveChannelArn =
        'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
      const liveChannelId = '8626488';

      mock.on(CreateInputCommand).resolves({
        Input: {
          Id: inputId,
        },
      });
      mock.on(CreateChannelCommand).resolves({
        Channel: {
          Arn: liveChannelArn,
          Id: liveChannelId,
        },
      });

      await mediaLiveChannelsManager.createChannel({
        eventId,
        packageChannelId,
        source,
      });

      const commandCalls = mock.commandCalls(CreateChannelCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toMatchSnapshot();
    });
  });

  describe('startChannel', () => {
    it('should start channel', async () => {
      const { mediaLiveChannelsManager } = setup();
      const channelId = '812345';

      await mediaLiveChannelsManager.startChannel(channelId);

      const commandCalls = mock.commandCalls(StartChannelCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        ChannelId: channelId,
      });
    });
  });

  describe('stopChannel', () => {
    it('should stop channel', async () => {
      const { mediaLiveChannelsManager } = setup();
      const channelId = '812345';

      await mediaLiveChannelsManager.stopChannel(channelId);

      const commandCalls = mock.commandCalls(StopChannelCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        ChannelId: channelId,
      });
    });
  });
});

const setup = () => {
  const client = new MediaLiveClient({
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
  const mediaLiveRoleArn =
    'arn:aws:iam::000000000000:role/trackflix-live-test-MediaLiveRole-8FSnLc3KkA4t';
  const mediaLiveChannelsManager = new MediaLiveChannelsManager({
    client,
    mediaLiveRoleArn,
  });

  return { client, mediaLiveRoleArn, mediaLiveChannelsManager };
};
