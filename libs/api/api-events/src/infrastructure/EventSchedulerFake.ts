import { EventScheduler, ScheduledEvent } from '../ports';

export class EventSchedulerFake implements EventScheduler {
  public readonly scheduledEvents: ScheduledEvent[] = [];

  public async scheduleEvent(scheduledEvent: ScheduledEvent) {
    this.scheduledEvents.push(scheduledEvent);
  }
}
