import { EventUpdate } from '@trackflix-live/types';

export interface EventUpdateSender {
  send(eventUpdate: EventUpdate): Promise<void>;
}
