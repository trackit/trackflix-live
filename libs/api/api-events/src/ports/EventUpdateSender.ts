import { EventUpdate } from '@trackflix-live/types';

export interface EventUpdateSender {
  send(eventUpdate: EventUpdate): Promise<void>;
  attachPolicyToIdentity(identityId: string): Promise<void>;
}
