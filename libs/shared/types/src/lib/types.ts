export enum EventStatus {
  TX = 'TX',
  PRE_TX = 'PRE-TX',
  POST_TX = 'POST-TX',
  ENDED = 'ENDED',
  ERROR = 'ERROR',
}

export enum InputType {
  MP4_FILE = 'MP4_FILE',
  TS_FILE = 'TS_FILE',
  URL_PULL = 'URL_PULL',
  RTP_PUSH = 'RTP_PUSH',
  RTMP_PUSH = 'RTMP_PUSH',
  RTMP_PULL = 'RTMP_PULL',
  MEDIACONNECT = 'MEDIACONNECT',
  SRT_CALLER = 'SRT_CALLER',
}

export type S3Source = { inputType: InputType.MP4_FILE; value: string };

export type TsFile = { inputType: InputType.TS_FILE; value: string };

export type Hls = { inputType: InputType.URL_PULL; value: string };

export type Rtp = {
  inputType: InputType.RTP_PUSH;
  inputSecurityGroups: string;
};

export type RtmpPush = {
  inputType: InputType.RTMP_PUSH;
  inputSecurityGroups: string;
  streamName: string;
};

export type RtmpPull = {
  inputType: InputType.RTMP_PULL;
  url: string;
  username?: string;
  password?: string;
};

export type MediaConnect = {
  inputType: InputType.MEDIACONNECT;
  flowArn: string;
  roleArn: string;
};

export enum SrtDecryptionAlgorithm {
  AES_128 = 'AES128',
  AES_192 = 'AES192',
  AES_256 = 'AES256',
}

export type SrtCaller = {
  inputType: InputType.SRT_CALLER;
  decryption?: {
    algorithm: SrtDecryptionAlgorithm;
    passphraseSecretArn: string;
  };
  srtListenerAddress: string;
  srtListenerPort: string;
  streamId: string;
  minimumLatency: number;
};

export type Source =
  | S3Source
  | Rtp
  | RtmpPush
  | RtmpPull
  | TsFile
  | Hls
  | MediaConnect
  | SrtCaller;

export enum LogType {
  PACKAGE_CHANNEL_CREATED = 'PACKAGE_CHANNEL_CREATED',
  LIVE_INPUT_CREATED = 'LIVE_INPUT_CREATED',
  LIVE_CHANNEL_CREATED = 'LIVE_CHANNEL_CREATED',
  LIVE_CHANNEL_STARTED = 'LIVE_CHANNEL_STARTED',
  LIVE_CHANNEL_STOPPED = 'LIVE_CHANNEL_STOPPED',
  LIVE_CHANNEL_DESTROYED = 'LIVE_CHANNEL_DESTROYED',
  LIVE_INPUT_DESTROYED = 'LIVE_INPUT_DESTROYED',
  PACKAGE_CHANNEL_DESTROYED = 'PACKAGE_CHANNEL_DESTROYED',
  CDN_ORIGIN_CREATED = 'CDN_ORIGIN_CREATED',
  CDN_ORIGIN_DESTROYED = 'CDN_ORIGIN_DESTROYED',
  ERROR_OCCURRED = 'ERROR_OCCURRED',
}

export enum EndpointType {
  HLS = 'HLS',
  DASH = 'DASH',
}

export interface EventLog {
  timestamp: number;
  type: LogType;
}

export interface EventEndpoint {
  url: string;
  type: EndpointType;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  onAirStartTime: string;
  onAirEndTime: string;
  createdTime: string;
  destroyedTime?: string;
  source: Source;
  status: EventStatus;
  endpoints: EventEndpoint[];
  logs: EventLog[];

  liveChannelId?: string;
  liveChannelArn?: string;
  liveInputId?: string;
  liveWaitingInputId?: string;
  packageDomainName?: string;
}

export enum EventUpdateAction {
  EVENT_UPDATE_CREATE = 'EVENT_UPDATE_CREATE',
  EVENT_UPDATE_UPDATE = 'EVENT_UPDATE_UPDATE',
}

export interface EventUpdateCreate {
  action: EventUpdateAction.EVENT_UPDATE_CREATE;
  value: Event;
}

export interface EventUpdateUpdate {
  action: EventUpdateAction.EVENT_UPDATE_UPDATE;
  value: Event;
}

export type EventUpdate = EventUpdateCreate | EventUpdateUpdate;
