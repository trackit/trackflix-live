export enum EventStatus {
  TX = 'TX',
  PRE_TX = 'PRE-TX',
  POST_TX = 'POST-TX',
  ENDED = 'ENDED',
  ERROR = 'ERROR',
}

export type S3Source = string;

export type Source = S3Source;

export enum LogType {
  PACKAGE_CHANNEL_CREATED = 'PACKAGE_CHANNEL_CREATED',
  LIVE_INPUT_CREATED = 'LIVE_INPUT_CREATED',
  LIVE_CHANNEL_CREATED = 'LIVE_CHANNEL_CREATED',
  LIVE_CHANNEL_STARTED = 'LIVE_CHANNEL_STARTED',
  LIVE_CHANNEL_STOPPED = 'LIVE_CHANNEL_STOPPED',
  LIVE_CHANNEL_DESTROYED = 'LIVE_CHANNEL_DESTROYED',
  LIVE_INPUT_DESTROYED = 'LIVE_INPUT_DESTROYED',
  PACKAGE_CHANNEL_DESTROYED = 'PACKAGE_CHANNEL_DESTROYED',
  CDN_DISTRIBUTION_CREATED = 'CDN_DISTRIBUTION_CREATED',
  CDN_DISTRIBUTION_DESTROYED = 'CDN_DISTRIBUTION_DESTROYED',
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
  cdnDistributionId?: string;
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
