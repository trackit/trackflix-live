export enum EventStatus {
  TX = 'TX',
  PRE_TX = 'PRE-TX',
  POST_TX = 'POST-TX',
  CONFIRMED = 'CONFIRMED',
  ENDED = 'ENDED',
}

export type S3Source = string;

export type Source = S3Source;

export interface Event {
  id: string;
  name: string;
  description: string;
  onAirStartTime: Date;
  onAirEndTime: Date;
  source: Source;
  status: EventStatus;
}

export enum EventUpdateAction {
  EVENT_UPDATE_CREATE = 'EVENT_UPDATE_CREATE',
}

export interface EventUpdateCreate {
  action: EventUpdateAction.EVENT_UPDATE_CREATE;
  value: Event;
}

export type EventUpdate = EventUpdateCreate;
