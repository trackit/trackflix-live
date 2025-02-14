import { EventUpdateSender } from '../ports/EventUpdateSender';
import { EventUpdate } from '@trackflix-live/types';

export class EventUpdateSenderFake implements EventUpdateSender {
  public readonly eventUpdates: EventUpdate[] = [];

  public async send(eventUpdate: EventUpdate): Promise<void> {
    this.eventUpdates.push(eventUpdate);
  }
}
