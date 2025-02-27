import { EventUpdate } from '@trackflix-live/types';
import { createInjectionToken } from '@trackflix-live/di';

export interface EventUpdateSender {
  send(eventUpdate: EventUpdate): Promise<void>;
  attachPolicyToIdentity(identityId: string): Promise<void>;
}

export const tokenEventUpdateSender =
  createInjectionToken<EventUpdateSender>('EventUpdateSender');
