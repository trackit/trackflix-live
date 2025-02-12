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

export enum EventUpdateAction {
  NEW_EVENT = 'new-event',
}
