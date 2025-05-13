import { mockClient } from 'aws-sdk-client-mock';
import {
  BatchUpdateScheduleCommand,
  CreateChannelCommand,
  CreateInputCommand,
  DeleteChannelCommand,
  DeleteInputCommand,
  MediaLiveClient,
  StartChannelCommand,
  StopChannelCommand,
} from '@aws-sdk/client-medialive';
import { MediaLiveChannelsManager } from './MediaLiveChannelsManager';
import { InputType, S3Source } from '@trackflix-live/types';

describe('MediaLive channels manager', () => {
  const mock = mockClient(MediaLiveClient);

  beforeEach(() => {
    mock.reset();
  });

  describe('createChannel', () => {
    it('should create inputs', async () => {
      const { mediaLiveChannelsManager, waitingSource } = setup();
      const eventId = 'dbb682ee-1dd6-4ec6-a666-03b04ace1f9d';
      const packageChannelId = '456789';
      const source: S3Source = {
        value: 's3://trackflix-live-demo-videos/oss117.mp4',
        inputType: InputType.MP4_FILE,
      };
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
      expect(commandCalls).toHaveLength(2);
      expect(commandCalls[0].args[0].input).toEqual({
        Name: expect.stringMatching(/^TrackflixLiveMLIW-.*/),
        Sources: [
          {
            Url: waitingSource,
          },
        ],
        Type: 'MP4_FILE',
      });
      expect(commandCalls[1].args[0].input).toEqual({
        Name: expect.stringMatching(/^TrackflixLiveMLI-.*/),
        Sources: [
          {
            Url: source.value,
          },
        ],
        Type: 'MP4_FILE',
      });
    });

    it('should create channel', async () => {
      const { mediaLiveChannelsManager } = setup();
      const eventId = 'dbb682ee-1dd6-4ec6-a666-03b04ace1f9d';
      const packageChannelId = '456789';
      const source: S3Source = {
        value: 's3://trackflix-live-demo-videos/oss117.mp4',
        inputType: InputType.MP4_FILE,
      };
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
      const eventId = '0b7bc597-1be8-4634-8cbf-54ffb7668fe6';
      const onAirStartTime = '2025-02-28T14:05:21.641Z';

      await mediaLiveChannelsManager.startChannel({
        channelId,
        eventId,
        onAirStartTime,
      });

      const commandCalls = mock.commandCalls(StartChannelCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        ChannelId: channelId,
      });
    });

    it('should create schedule', async () => {
      const { mediaLiveChannelsManager } = setup();
      const channelId = '812345';
      const eventId = '0b7bc597-1be8-4634-8cbf-54ffb7668fe6';
      const onAirStartTime = '2025-02-28T14:05:21.641Z';

      await mediaLiveChannelsManager.startChannel({
        channelId,
        eventId,
        onAirStartTime,
      });

      const commandCalls = mock.commandCalls(BatchUpdateScheduleCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        ChannelId: channelId,
        Creates: {
          ScheduleActions: [
            {
              ActionName: 'StartContent',
              ScheduleActionSettings: {
                InputSwitchSettings: {
                  InputAttachmentNameReference: `TrackflixLiveMLI-${eventId}`,
                },
              },
              ScheduleActionStartSettings: {
                FixedModeScheduleActionStartSettings: {
                  Time: onAirStartTime,
                },
              },
            },
          ],
        },
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

  describe('deleteChannel', () => {
    it('should delete channel', async () => {
      const { mediaLiveChannelsManager } = setup();
      const channelId = '812345';

      await mediaLiveChannelsManager.deleteChannel(channelId);

      const commandCalls = mock.commandCalls(DeleteChannelCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        ChannelId: channelId,
      });
    });
  });

  describe('deleteInput', () => {
    it('should delete input', async () => {
      const { mediaLiveChannelsManager } = setup();
      const inputId = '812345';

      await mediaLiveChannelsManager.deleteInput(inputId);

      const commandCalls = mock.commandCalls(DeleteInputCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        InputId: inputId,
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
  const waitingSource = 's3://trackflix-live-demo-videos/waiting.mp4';

  const mediaLiveChannelsManager = new MediaLiveChannelsManager({
    client,
    mediaLiveRoleArn,
    waitingSource,
  });

  return { client, mediaLiveRoleArn, mediaLiveChannelsManager, waitingSource };
};
