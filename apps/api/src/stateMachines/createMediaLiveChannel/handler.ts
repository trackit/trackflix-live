import {
  CreateInputCommand,
  MediaLiveClient,
  CreateChannelCommand,
  AudioDescriptionAudioTypeControl,
  AacRawFormat,
  AacSpec,
  AudioDescriptionLanguageCodeControl,
  TimecodeConfigSource,
} from '@aws-sdk/client-medialive';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

export const main = async ({
  input: { eventId, mediaPackageChannelId },
  taskToken,
}: {
  input: {
    eventId: string;
    mediaPackageChannelId: string;
  };
  taskToken: string;
}): Promise<{
  eventId: string;
  mediaPackageChannelId: string;
  mediaLiveChannelId: string;
  mediaLiveChannelArn: string;
}> => {
  const mediaLiveClient = new MediaLiveClient();

  const inputName = `TrackflixLiveMLI-${eventId}`;
  const input = await mediaLiveClient.send(
    new CreateInputCommand({
      Name: inputName,
      Type: 'MP4_FILE',
      Sources: [
        {
          Url: 's3://trackflix-live-demo-videos/oss117.mp4', // TODO: Fetch event and use real source
        },
      ],
    })
  );

  const mediaLiveChannel = await mediaLiveClient.send(
    new CreateChannelCommand({
      Name: `TrackflixLiveMLC-${eventId}`,
      InputSpecification: {
        Codec: 'AVC',
        MaximumBitrate: 'MAX_10_MBPS',
        Resolution: 'HD',
      },
      RoleArn: 'arn:aws:iam::576872909007:role/MediaLiveAccessRole', // TODO: Create role in template
      ChannelClass: 'SINGLE_PIPELINE',
      EncoderSettings: {
        AudioDescriptions: [
          {
            AudioSelectorName: 'default',
            AudioTypeControl: AudioDescriptionAudioTypeControl.FOLLOW_INPUT,
            CodecSettings: {
              AacSettings: {
                Bitrate: 64000,
                RawFormat: AacRawFormat.NONE,
                Spec: AacSpec.MPEG4,
              },
            },
            LanguageCodeControl:
              AudioDescriptionLanguageCodeControl.FOLLOW_INPUT,
            Name: 'audio_1_aac64',
          },
          {
            AudioSelectorName: 'default',
            AudioTypeControl: AudioDescriptionAudioTypeControl.FOLLOW_INPUT,
            CodecSettings: {
              AacSettings: {
                Bitrate: 64000,
                RawFormat: AacRawFormat.NONE,
                Spec: AacSpec.MPEG4,
              },
            },
            LanguageCodeControl:
              AudioDescriptionLanguageCodeControl.FOLLOW_INPUT,
            Name: 'audio_2_aac64',
          },
          {
            AudioSelectorName: 'default',
            AudioTypeControl: AudioDescriptionAudioTypeControl.FOLLOW_INPUT,
            CodecSettings: {
              AacSettings: {
                Bitrate: 64000,
                RawFormat: AacRawFormat.NONE,
                Spec: AacSpec.MPEG4,
              },
            },
            LanguageCodeControl:
              AudioDescriptionLanguageCodeControl.FOLLOW_INPUT,
            Name: 'audio_3_aac64',
          },
          {
            AudioSelectorName: 'default',
            AudioTypeControl: AudioDescriptionAudioTypeControl.FOLLOW_INPUT,
            CodecSettings: {
              AacSettings: {
                Bitrate: 96000,
                RawFormat: AacRawFormat.NONE,
                Spec: AacSpec.MPEG4,
              },
            },
            LanguageCodeControl:
              AudioDescriptionLanguageCodeControl.FOLLOW_INPUT,
            Name: 'audio_1_aac96',
          },
          {
            AudioSelectorName: 'default',
            AudioTypeControl: AudioDescriptionAudioTypeControl.FOLLOW_INPUT,
            CodecSettings: {
              AacSettings: {
                Bitrate: 96000,
                RawFormat: AacRawFormat.NONE,
                Spec: AacSpec.MPEG4,
              },
            },
            LanguageCodeControl:
              AudioDescriptionLanguageCodeControl.FOLLOW_INPUT,
            Name: 'audio_2_aac96',
          },
          {
            AudioSelectorName: 'default',
            AudioTypeControl: AudioDescriptionAudioTypeControl.FOLLOW_INPUT,
            CodecSettings: {
              AacSettings: {
                Bitrate: 96000,
                RawFormat: AacRawFormat.NONE,
                Spec: AacSpec.MPEG4,
              },
            },
            LanguageCodeControl:
              AudioDescriptionLanguageCodeControl.FOLLOW_INPUT,
            Name: 'audio_3_aac96',
          },
          {
            AudioSelectorName: 'default',
            AudioTypeControl: AudioDescriptionAudioTypeControl.FOLLOW_INPUT,
            CodecSettings: {
              AacSettings: {
                Bitrate: 128000,
                RawFormat: AacRawFormat.NONE,
                Spec: AacSpec.MPEG4,
              },
            },
            LanguageCodeControl:
              AudioDescriptionLanguageCodeControl.FOLLOW_INPUT,
            Name: 'audio_1_aac128',
          },
          {
            AudioSelectorName: 'default',
            AudioTypeControl: AudioDescriptionAudioTypeControl.FOLLOW_INPUT,
            CodecSettings: {
              AacSettings: {
                Bitrate: 128000,
                RawFormat: AacRawFormat.NONE,
                Spec: AacSpec.MPEG4,
              },
            },
            LanguageCodeControl:
              AudioDescriptionLanguageCodeControl.FOLLOW_INPUT,
            Name: 'audio_2_aac128',
          },
          {
            AudioSelectorName: 'default',
            AudioTypeControl: AudioDescriptionAudioTypeControl.FOLLOW_INPUT,
            CodecSettings: {
              AacSettings: {
                Bitrate: 128000,
                RawFormat: AacRawFormat.NONE,
                Spec: AacSpec.MPEG4,
              },
            },
            LanguageCodeControl:
              AudioDescriptionLanguageCodeControl.FOLLOW_INPUT,
            Name: 'audio_3_aac128',
          },
        ],
        CaptionDescriptions: [],
        OutputGroups: [
          {
            OutputGroupSettings: {
              MediaPackageGroupSettings: {
                Destination: {
                  DestinationRefId: 'MainDestination',
                },
              },
            },
            Outputs: [
              {
                AudioDescriptionNames: ['audio_2_aac96'],
                CaptionDescriptionNames: [],
                OutputName: '960_540',
                OutputSettings: {
                  MediaPackageOutputSettings: {},
                },
                VideoDescriptionName: 'video_960_540',
              },
              {
                AudioDescriptionNames: ['audio_3_aac96'],
                CaptionDescriptionNames: [],
                OutputName: '1280_720_1',
                OutputSettings: {
                  MediaPackageOutputSettings: {},
                },
                VideoDescriptionName: 'video_1280_720_1',
              },
              {
                AudioDescriptionNames: ['audio_1_aac128'],
                CaptionDescriptionNames: [],
                OutputName: '1280_720_2',
                OutputSettings: {
                  MediaPackageOutputSettings: {},
                },
                VideoDescriptionName: 'video_1280_720_2',
              },
              {
                AudioDescriptionNames: ['audio_2_aac128'],
                CaptionDescriptionNames: [],
                OutputName: '1280_720_3',
                OutputSettings: {
                  MediaPackageOutputSettings: {},
                },
                VideoDescriptionName: 'video_1280_720_3',
              },
              {
                AudioDescriptionNames: ['audio_3_aac128'],
                CaptionDescriptionNames: [],
                OutputName: '1920_1080',
                OutputSettings: {
                  MediaPackageOutputSettings: {},
                },
                VideoDescriptionName: 'video_1920_1080',
              },
              {
                AudioDescriptionNames: ['audio_1_aac64'],
                CaptionDescriptionNames: [],
                OutputName: '416_234',
                OutputSettings: {
                  MediaPackageOutputSettings: {},
                },
                VideoDescriptionName: 'video_416_234',
              },
              {
                AudioDescriptionNames: ['audio_2_aac64'],
                CaptionDescriptionNames: [],
                OutputName: '480_270',
                OutputSettings: {
                  MediaPackageOutputSettings: {},
                },
                VideoDescriptionName: 'video_480_270',
              },
              {
                AudioDescriptionNames: ['audio_3_aac64'],
                CaptionDescriptionNames: [],
                OutputName: '640_360',
                OutputSettings: {
                  MediaPackageOutputSettings: {},
                },
                VideoDescriptionName: 'video_640_360',
              },
              {
                AudioDescriptionNames: ['audio_1_aac96'],
                CaptionDescriptionNames: [],
                OutputName: '768_432',
                OutputSettings: {
                  MediaPackageOutputSettings: {},
                },
                VideoDescriptionName: 'video_768_432',
              },
            ],
          },
        ],
        TimecodeConfig: {
          Source: TimecodeConfigSource.SYSTEMCLOCK,
        },
        VideoDescriptions: [
          {
            CodecSettings: {
              H264Settings: {
                AdaptiveQuantization: 'HIGH',
                AfdSignaling: 'NONE',
                Bitrate: 200000,
                ColorMetadata: 'INSERT',
                EntropyEncoding: 'CAVLC',
                FlickerAq: 'ENABLED',
                ForceFieldPictures: 'DISABLED',
                FramerateControl: 'SPECIFIED',
                FramerateDenominator: 1001,
                FramerateNumerator: 15000,
                GopBReference: 'DISABLED',
                GopClosedCadence: 1,
                GopNumBFrames: 0,
                GopSize: 30,
                GopSizeUnits: 'FRAMES',
                Level: 'H264_LEVEL_3',
                LookAheadRateControl: 'HIGH',
                NumRefFrames: 1,
                ParControl: 'SPECIFIED',
                Profile: 'BASELINE',
                RateControlMode: 'CBR',
                ScanType: 'PROGRESSIVE',
                SceneChangeDetect: 'ENABLED',
                SpatialAq: 'ENABLED',
                SubgopLength: 'FIXED',
                Syntax: 'DEFAULT',
                TemporalAq: 'ENABLED',
                TimecodeInsertion: 'DISABLED',
              },
            },
            Height: 236,
            Name: 'video_416_234',
            RespondToAfd: 'NONE',
            ScalingBehavior: 'DEFAULT',
            Sharpness: 50,
            Width: 416,
          },
          {
            CodecSettings: {
              H264Settings: {
                AdaptiveQuantization: 'HIGH',
                AfdSignaling: 'NONE',
                Bitrate: 400000,
                ColorMetadata: 'INSERT',
                EntropyEncoding: 'CAVLC',
                FlickerAq: 'ENABLED',
                ForceFieldPictures: 'DISABLED',
                FramerateControl: 'SPECIFIED',
                FramerateDenominator: 1001,
                FramerateNumerator: 15000,
                GopBReference: 'DISABLED',
                GopClosedCadence: 1,
                GopNumBFrames: 0,
                GopSize: 30,
                GopSizeUnits: 'FRAMES',
                Level: 'H264_LEVEL_3',
                LookAheadRateControl: 'HIGH',
                NumRefFrames: 1,
                ParControl: 'SPECIFIED',
                Profile: 'BASELINE',
                RateControlMode: 'CBR',
                ScanType: 'PROGRESSIVE',
                SceneChangeDetect: 'ENABLED',
                SpatialAq: 'ENABLED',
                SubgopLength: 'FIXED',
                Syntax: 'DEFAULT',
                TemporalAq: 'ENABLED',
                TimecodeInsertion: 'DISABLED',
              },
            },
            Height: 272,
            Name: 'video_480_270',
            RespondToAfd: 'NONE',
            ScalingBehavior: 'DEFAULT',
            Sharpness: 50,
            Width: 480,
          },
          {
            CodecSettings: {
              H264Settings: {
                AdaptiveQuantization: 'HIGH',
                AfdSignaling: 'NONE',
                Bitrate: 800000,
                ColorMetadata: 'INSERT',
                EntropyEncoding: 'CABAC',
                FlickerAq: 'ENABLED',
                ForceFieldPictures: 'DISABLED',
                FramerateControl: 'SPECIFIED',
                FramerateDenominator: 1001,
                FramerateNumerator: 30000,
                GopBReference: 'ENABLED',
                GopClosedCadence: 1,
                GopNumBFrames: 3,
                GopSize: 60,
                GopSizeUnits: 'FRAMES',
                Level: 'H264_LEVEL_3',
                LookAheadRateControl: 'HIGH',
                NumRefFrames: 1,
                ParControl: 'SPECIFIED',
                Profile: 'MAIN',
                RateControlMode: 'CBR',
                ScanType: 'PROGRESSIVE',
                SceneChangeDetect: 'ENABLED',
                SpatialAq: 'ENABLED',
                SubgopLength: 'FIXED',
                Syntax: 'DEFAULT',
                TemporalAq: 'ENABLED',
                TimecodeInsertion: 'DISABLED',
              },
            },
            Height: 360,
            Name: 'video_640_360',
            RespondToAfd: 'NONE',
            ScalingBehavior: 'DEFAULT',
            Sharpness: 50,
            Width: 640,
          },
          {
            CodecSettings: {
              H264Settings: {
                AdaptiveQuantization: 'HIGH',
                AfdSignaling: 'NONE',
                Bitrate: 1200000,
                ColorMetadata: 'INSERT',
                EntropyEncoding: 'CABAC',
                FlickerAq: 'ENABLED',
                ForceFieldPictures: 'DISABLED',
                FramerateControl: 'SPECIFIED',
                FramerateDenominator: 1001,
                FramerateNumerator: 30000,
                GopBReference: 'ENABLED',
                GopClosedCadence: 1,
                GopNumBFrames: 3,
                GopSize: 60,
                GopSizeUnits: 'FRAMES',
                Level: 'H264_LEVEL_4_1',
                LookAheadRateControl: 'HIGH',
                NumRefFrames: 1,
                ParControl: 'SPECIFIED',
                Profile: 'MAIN',
                RateControlMode: 'CBR',
                ScanType: 'PROGRESSIVE',
                SceneChangeDetect: 'ENABLED',
                SpatialAq: 'ENABLED',
                SubgopLength: 'FIXED',
                Syntax: 'DEFAULT',
                TemporalAq: 'ENABLED',
                TimecodeInsertion: 'DISABLED',
              },
            },
            Height: 432,
            Name: 'video_768_432',
            RespondToAfd: 'NONE',
            ScalingBehavior: 'DEFAULT',
            Sharpness: 50,
            Width: 768,
          },
          {
            CodecSettings: {
              H264Settings: {
                AdaptiveQuantization: 'HIGH',
                AfdSignaling: 'NONE',
                Bitrate: 2200000,
                ColorMetadata: 'INSERT',
                EntropyEncoding: 'CABAC',
                FlickerAq: 'ENABLED',
                ForceFieldPictures: 'DISABLED',
                FramerateControl: 'SPECIFIED',
                FramerateDenominator: 1001,
                FramerateNumerator: 30000,
                GopBReference: 'ENABLED',
                GopClosedCadence: 1,
                GopNumBFrames: 3,
                GopSize: 60,
                GopSizeUnits: 'FRAMES',
                Level: 'H264_LEVEL_4_1',
                LookAheadRateControl: 'HIGH',
                NumRefFrames: 1,
                ParControl: 'SPECIFIED',
                Profile: 'HIGH',
                RateControlMode: 'CBR',
                ScanType: 'PROGRESSIVE',
                SceneChangeDetect: 'ENABLED',
                SpatialAq: 'ENABLED',
                SubgopLength: 'FIXED',
                Syntax: 'DEFAULT',
                TemporalAq: 'ENABLED',
                TimecodeInsertion: 'DISABLED',
              },
            },
            Height: 540,
            Name: 'video_960_540',
            RespondToAfd: 'NONE',
            ScalingBehavior: 'DEFAULT',
            Sharpness: 50,
            Width: 960,
          },
          {
            CodecSettings: {
              H264Settings: {
                AdaptiveQuantization: 'HIGH',
                AfdSignaling: 'NONE',
                Bitrate: 3300000,
                ColorMetadata: 'INSERT',
                EntropyEncoding: 'CABAC',
                FlickerAq: 'ENABLED',
                ForceFieldPictures: 'DISABLED',
                FramerateControl: 'SPECIFIED',
                FramerateDenominator: 1001,
                FramerateNumerator: 30000,
                GopBReference: 'ENABLED',
                GopClosedCadence: 1,
                GopNumBFrames: 3,
                GopSize: 60,
                GopSizeUnits: 'FRAMES',
                Level: 'H264_LEVEL_4_1',
                LookAheadRateControl: 'HIGH',
                NumRefFrames: 1,
                ParControl: 'SPECIFIED',
                Profile: 'HIGH',
                RateControlMode: 'CBR',
                ScanType: 'PROGRESSIVE',
                SceneChangeDetect: 'ENABLED',
                SpatialAq: 'ENABLED',
                SubgopLength: 'FIXED',
                Syntax: 'DEFAULT',
                TemporalAq: 'ENABLED',
                TimecodeInsertion: 'DISABLED',
              },
            },
            Height: 720,
            Name: 'video_1280_720_1',
            RespondToAfd: 'NONE',
            ScalingBehavior: 'DEFAULT',
            Sharpness: 50,
            Width: 1280,
          },
          {
            CodecSettings: {
              H264Settings: {
                AdaptiveQuantization: 'HIGH',
                AfdSignaling: 'NONE',
                Bitrate: 4700000,
                ColorMetadata: 'INSERT',
                EntropyEncoding: 'CABAC',
                FlickerAq: 'ENABLED',
                ForceFieldPictures: 'DISABLED',
                FramerateControl: 'SPECIFIED',
                FramerateDenominator: 1001,
                FramerateNumerator: 30000,
                GopBReference: 'ENABLED',
                GopClosedCadence: 1,
                GopNumBFrames: 3,
                GopSize: 60,
                GopSizeUnits: 'FRAMES',
                Level: 'H264_LEVEL_4_1',
                LookAheadRateControl: 'HIGH',
                NumRefFrames: 1,
                ParControl: 'SPECIFIED',
                Profile: 'HIGH',
                RateControlMode: 'CBR',
                ScanType: 'PROGRESSIVE',
                SceneChangeDetect: 'ENABLED',
                SpatialAq: 'ENABLED',
                SubgopLength: 'FIXED',
                Syntax: 'DEFAULT',
                TemporalAq: 'ENABLED',
                TimecodeInsertion: 'DISABLED',
              },
            },
            Height: 720,
            Name: 'video_1280_720_2',
            RespondToAfd: 'NONE',
            ScalingBehavior: 'DEFAULT',
            Sharpness: 50,
            Width: 1280,
          },
          {
            CodecSettings: {
              H264Settings: {
                AdaptiveQuantization: 'HIGH',
                AfdSignaling: 'NONE',
                Bitrate: 6200000,
                ColorMetadata: 'INSERT',
                EntropyEncoding: 'CABAC',
                FlickerAq: 'ENABLED',
                ForceFieldPictures: 'DISABLED',
                FramerateControl: 'SPECIFIED',
                FramerateDenominator: 1001,
                FramerateNumerator: 30000,
                GopBReference: 'ENABLED',
                GopClosedCadence: 1,
                GopNumBFrames: 3,
                GopSize: 60,
                GopSizeUnits: 'FRAMES',
                Level: 'H264_LEVEL_4_1',
                LookAheadRateControl: 'HIGH',
                NumRefFrames: 1,
                ParControl: 'SPECIFIED',
                Profile: 'HIGH',
                RateControlMode: 'CBR',
                ScanType: 'PROGRESSIVE',
                SceneChangeDetect: 'ENABLED',
                SpatialAq: 'ENABLED',
                SubgopLength: 'FIXED',
                Syntax: 'DEFAULT',
                TemporalAq: 'ENABLED',
                TimecodeInsertion: 'DISABLED',
              },
            },
            Height: 720,
            Name: 'video_1280_720_3',
            RespondToAfd: 'NONE',
            ScalingBehavior: 'DEFAULT',
            Sharpness: 50,
            Width: 1280,
          },
          {
            CodecSettings: {
              H264Settings: {
                AdaptiveQuantization: 'HIGH',
                AfdSignaling: 'NONE',
                Bitrate: 8000000,
                ColorMetadata: 'INSERT',
                EntropyEncoding: 'CABAC',
                FlickerAq: 'ENABLED',
                ForceFieldPictures: 'DISABLED',
                FramerateControl: 'SPECIFIED',
                FramerateDenominator: 1001,
                FramerateNumerator: 30000,
                GopBReference: 'DISABLED',
                GopClosedCadence: 1,
                GopNumBFrames: 1,
                GopSize: 60,
                GopSizeUnits: 'FRAMES',
                Level: 'H264_LEVEL_4_1',
                LookAheadRateControl: 'HIGH',
                NumRefFrames: 1,
                ParControl: 'SPECIFIED',
                Profile: 'HIGH',
                RateControlMode: 'CBR',
                ScanType: 'PROGRESSIVE',
                SceneChangeDetect: 'ENABLED',
                SpatialAq: 'ENABLED',
                SubgopLength: 'FIXED',
                Syntax: 'DEFAULT',
                TemporalAq: 'ENABLED',
                TimecodeInsertion: 'DISABLED',
              },
            },
            Height: 1080,
            Name: 'video_1920_1080',
            RespondToAfd: 'NONE',
            ScalingBehavior: 'DEFAULT',
            Sharpness: 50,
            Width: 1920,
          },
        ],
      },
      Destinations: [
        {
          Id: 'MainDestination',
          MediaPackageSettings: [
            {
              ChannelId: mediaPackageChannelId,
            },
          ],
        },
      ],
      InputAttachments: [
        {
          InputId: input.Input!.Id,
          InputAttachmentName: inputName,
        },
      ],
    })
  );

  const dynamoClient = new DynamoDBClient();
  const documentClient = DynamoDBDocumentClient.from(dynamoClient);

  await documentClient.send(
    new PutCommand({
      TableName: process.env.TASK_TOKENS_TABLE,
      Item: {
        key: `${mediaLiveChannel.Channel!.Arn!}#CREATED`,
        taskToken: taskToken,
        output: {
          eventId,
          mediaPackageChannelId,
          mediaLiveChannelId: mediaLiveChannel.Channel!.Id!,
          mediaLiveChannelArn: mediaLiveChannel.Channel!.Arn!,
        },
      },
    })
  );

  return {
    eventId,
    mediaPackageChannelId,
    mediaLiveChannelId: mediaLiveChannel.Channel!.Id!,
    mediaLiveChannelArn: mediaLiveChannel.Channel!.Arn!,
  };
};
