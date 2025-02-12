import { EventUpdateAction } from '@trackflix-live/types';

export type EventUpdateValue = Record<string, unknown>;

export interface EventUpdateSender {
  send(action: EventUpdateAction, value: EventUpdateValue): Promise<void>;
}
