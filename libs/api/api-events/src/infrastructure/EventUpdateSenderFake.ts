import {
  EventUpdateSender,
  EventUpdateValue,
} from '../ports/EventUpdateSender';
import { EventUpdateAction } from '@trackflix-live/types';

export class EventUpdateSenderFake implements EventUpdateSender {
  public readonly eventUpdates = new Array<{
    action: EventUpdateAction;
    value: EventUpdateValue;
  }>();

  public async send(
    action: EventUpdateAction,
    value: EventUpdateValue
  ): Promise<void> {
    this.eventUpdates.push({ action, value });
  }
}
