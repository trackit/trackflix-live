import { EventUpdateSender } from '../ports/EventUpdateSender';
import { EventUpdate } from '@trackflix-live/types';
import { createInjectionToken } from '@trackflix-live/di';

export class EventUpdateSenderFake implements EventUpdateSender {
  public readonly eventUpdates: EventUpdate[] = [];

  public readonly attachedIdentities: string[] = [];

  public async send(eventUpdate: EventUpdate): Promise<void> {
    this.eventUpdates.push(structuredClone(eventUpdate));
  }

  public async attachPolicyToIdentity(identityId: string): Promise<void> {
    this.attachedIdentities.push(identityId);
  }
}

export const tokenEventUpdateSenderFake =
  createInjectionToken<EventUpdateSenderFake>('EventUpdateSenderFake', {
    useClass: EventUpdateSenderFake,
  });
