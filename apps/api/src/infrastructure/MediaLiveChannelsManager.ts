import {
  CreateChannelParameters,
  CreateChannelResponse,
  isCdi,
  isMediaConnect,
  isMulticast,
  isRtmpPull,
  isRtmpPush,
  isRtp,
  isSrtCaller,
  isString,
  LiveChannelsManager,
  StartChannelParameters,
} from '@trackflix-live/api-events';
import {
  CreateInputCommand,
  MediaLiveClient,
  CreateChannelCommand,
  AudioDescriptionAudioTypeControl,
  AacRawFormat,
  AacSpec,
  AudioDescriptionLanguageCodeControl,
  TimecodeConfigSource,
  StartChannelCommand,
  StopChannelCommand,
  DeleteChannelCommand,
  DeleteInputCommand,
  BatchUpdateScheduleCommand,
  CreateInputCommandInput,
  InputType,
} from '@aws-sdk/client-medialive';
import {
  Cdi,
  MediaConnect,
  Multicast,
  RtmpPull,
  RtmpPush,
  Rtp,
  Source,
  SrtCaller,
} from '@trackflix-live/types';

export class MediaLiveChannelsManager implements LiveChannelsManager {
  private readonly client: MediaLiveClient;

  private readonly mediaLiveRoleArn: string;

  private readonly waitingSource: string;

  public constructor({
    client,
    mediaLiveRoleArn,
    waitingSource,
  }: {
    client: MediaLiveClient;
    mediaLiveRoleArn: string;
    waitingSource: string;
  }) {
    this.client = client;
    this.mediaLiveRoleArn = mediaLiveRoleArn;
    this.waitingSource = waitingSource;
  }

  public async createChannel({
    eventId,
    source,
    type,
    packageChannelId,
  }: CreateChannelParameters): Promise<CreateChannelResponse> {
    const waitingInputName = `TrackflixLiveMLIW-${eventId}`;
    const waitingInput = await this.client.send(
      new CreateInputCommand({
        Name: waitingInputName,
        Type: 'MP4_FILE',
        Sources: [
          {
            Url: this.waitingSource,
          },
        ],
      })
    );

    if (
      waitingInput.Input === undefined ||
      waitingInput.Input.Id === undefined
    ) {
      throw new Error(`Could not create MediaLive input ${waitingInputName}`);
    }

    const inputName = `TrackflixLiveMLI-${eventId}`;
    console.log(type);
    const input = await this.client.send(
      new CreateInputCommand(this.createInputCommand(type, source, inputName))
    );

    if (input.Input === undefined || input.Input.Id === undefined) {
      throw new Error(`Could not create MediaLive input ${inputName}`);
    }

    const channelName = `TrackflixLiveMLC-${eventId}`;
    const mediaLiveChannel = await this.client.send(
      new CreateChannelCommand({
        Name: channelName,
        InputSpecification: {
          Codec: 'AVC',
          MaximumBitrate: 'MAX_10_MBPS',
          Resolution: 'HD',
        },
        RoleArn: this.mediaLiveRoleArn,
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
                ChannelId: packageChannelId,
              },
            ],
          },
        ],
        InputAttachments: [
          {
            InputId: waitingInput.Input.Id,
            InputAttachmentName: waitingInputName,
          },
          {
            InputId: input.Input.Id,
            InputAttachmentName: inputName,
            InputSettings:
              type === InputType.URL_PULL
                ? {
                    NetworkInputSettings: {
                      HlsInputSettings: {
                        BufferSegments: 3,
                      },
                    },
                  }
                : undefined,
          },
        ],
      })
    );
    if (
      mediaLiveChannel.Channel === undefined ||
      mediaLiveChannel.Channel.Id === undefined ||
      mediaLiveChannel.Channel.Arn === undefined
    ) {
      throw new Error(`Could not create MediaLive channel ${channelName}`);
    }

    return {
      channelArn: mediaLiveChannel.Channel.Arn,
      channelId: mediaLiveChannel.Channel.Id,
      inputId: input.Input.Id,
      waitingInputId: waitingInput.Input.Id,
    };
  }

  public async startChannel({
    eventId,
    channelId,
    onAirStartTime,
  }: StartChannelParameters): Promise<void> {
    const inputName = `TrackflixLiveMLI-${eventId}`;

    await this.client.send(
      new BatchUpdateScheduleCommand({
        ChannelId: channelId,
        Creates: {
          ScheduleActions: [
            {
              ActionName: 'StartContent',
              ScheduleActionSettings: {
                InputSwitchSettings: {
                  InputAttachmentNameReference: inputName,
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
      })
    );

    await this.client.send(
      new StartChannelCommand({
        ChannelId: channelId,
      })
    );
  }

  public async stopChannel(channelId: string): Promise<void> {
    await this.client.send(
      new StopChannelCommand({
        ChannelId: channelId,
      })
    );
  }

  public async deleteChannel(channelId: string): Promise<void> {
    await this.client.send(
      new DeleteChannelCommand({
        ChannelId: channelId,
      })
    );
  }

  public async deleteInput(inputId: string): Promise<void> {
    await this.client.send(
      new DeleteInputCommand({
        InputId: inputId,
      })
    );
  }

  private createInputCommand(
    type: InputType,
    source: Source,
    inputName: string
  ): CreateInputCommandInput {
    if (
      isString(source) &&
      (type === InputType.TS_FILE ||
        type === InputType.MP4_FILE ||
        type === InputType.URL_PULL)
    ) {
      return {
        Name: inputName,
        Type: type,
        Sources: this.buildClassicSource(source),
      };
    }
    if (isRtp(source, type)) {
      return this.buildRtp(source, inputName);
    }
    if (isRtmpPush(source, type)) {
      return this.buildRtmpPush(source, inputName);
    }
    if (isRtmpPull(source, type)) {
      return this.buildRtmpPull(source, inputName);
    }
    if (isMediaConnect(source, type)) {
      return this.buildMediaConnect(source, inputName);
    }
    if (isMulticast(source, type)) {
      return this.buildMulticast(source, inputName);
    }
    if (isCdi(source, type)) {
      return this.buildCdi(source, inputName);
    }
    if (isSrtCaller(source, type)) {
      return this.buildSrtCaller(source, inputName);
    }
    return {
      Name: inputName,
      Type: type,
      Sources: this.buildClassicSource(''),
    };
  }

  private buildClassicSource(source: string) {
    return [
      {
        Url: source,
      },
    ];
  }

  private buildRtp(source: Rtp, inputName: string): CreateInputCommandInput {
    return {
      Name: inputName,
      Type: 'RTP_PUSH',
      InputNetworkLocation: source.inputNetworkLocation,
      InputSecurityGroups: source.inputSecurityGroups
        ? [source.inputSecurityGroups]
        : undefined,
      Vpc: {
        SubnetIds: [source.vpcSettings.subnetIds],
        SecurityGroupIds: [source.vpcSettings.securityGroupId],
      },
      RoleArn: source.roleArn,
      Destinations: [{ Network: source.networkArn }],
    };
  }

  private buildRtmpPush(
    source: RtmpPush,
    inputName: string
  ): CreateInputCommandInput {
    return {
      Name: inputName,
      Type: 'RTMP_PUSH',
      InputNetworkLocation: source.inputNetworkLocation,
      InputSecurityGroups: source.inputSecurityGroups
        ? [source.inputSecurityGroups]
        : undefined,
      Vpc: {
        SubnetIds: [source.vpcSettings.subnetIds],
        SecurityGroupIds: [source.vpcSettings.securityGroupId],
      },
      RoleArn: source.roleArn,
    };
  }

  private buildRtmpPull(
    source: RtmpPull,
    inputName: string
  ): CreateInputCommandInput {
    return {
      Name: inputName,
      Type: 'RTMP_PUSH',
      Sources: [
        {
          Url: source.url,
          PasswordParam: source.password,
          Username: source.username,
        },
      ],
    };
  }

  private buildMediaConnect(
    source: MediaConnect,
    inputName: string
  ): CreateInputCommandInput {
    return {
      Name: inputName,
      Type: InputType.MEDIACONNECT,
      RoleArn: source.roleArn,
      MediaConnectFlows: [
        {
          FlowArn: source.flowArn,
        },
      ],
    };
  }

  private buildMulticast(
    source: Multicast,
    inputName: string
  ): CreateInputCommandInput {
    return {
      Name: inputName,
      Type: InputType.MULTICAST,
      MulticastSettings: {
        Sources: [
          {
            Url: source.url,
            SourceIp: source.sourceIp,
          },
        ],
      },
    };
  }

  private buildCdi(source: Cdi, inputName: string): CreateInputCommandInput {
    return {
      Name: inputName,
      Vpc: {
        SubnetIds: [source.vpcSettings.subnetIds],
        SecurityGroupIds: [source.vpcSettings.securityGroupId],
      },
      RoleArn: source.roleArn,
    };
  }

  private buildSrtCaller(
    source: SrtCaller,
    inputName: string
  ): CreateInputCommandInput {
    return {
      Name: inputName,
      SrtSettings: {
        SrtCallerSources: [
          {
            StreamId: source.streamId,
            SrtListenerPort: source.srtListenerPort,
            SrtListenerAddress: source.srtListenerAddress,
            MinimumLatency: source.minimumLatency,
            Decryption: source.decryption,
          },
        ],
      },
    };
  }
}
