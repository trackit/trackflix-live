export enum EventStatus {
  TX = 'TX',
  PRE_TX = 'PRE-TX',
  POST_TX = 'POST-TX',
  CONFIRMED = 'CONFIRMED',
  ENDED = 'ENDED',
}

export interface S3Source {
  bucket: string;
  key: string;
}

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

export interface EventUpdateCreate {
  action: 'EVENT_UPDATE_CREATE';
  value: Event;
}

export interface EventUpdateDelete {
  action: 'EVENT_UPDATE_DELETE';
  value: Event;
}

export type EventUpdate = EventUpdateCreate | EventUpdateDelete;
