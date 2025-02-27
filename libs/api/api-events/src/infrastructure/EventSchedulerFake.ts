import { EventScheduler, ScheduledEvent } from '../ports';
import { createInjectionToken } from 'di';

export class EventSchedulerFake implements EventScheduler {
  public readonly scheduledEvents: ScheduledEvent[] = [];

  public async scheduleEvent(scheduledEvent: ScheduledEvent) {
    this.scheduledEvents.push(scheduledEvent);
  }
}

export const tokenEventSchedulerStartFake =
  createInjectionToken<EventSchedulerFake>('EventSchedulerStartFake', {
    useClass: EventSchedulerFake,
  });

export const tokenEventSchedulerStopFake =
  createInjectionToken<EventSchedulerFake>('EventSchedulerStopFake', {
    useClass: EventSchedulerFake,
  });
