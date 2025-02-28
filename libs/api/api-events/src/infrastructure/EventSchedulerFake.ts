import { EventScheduler, ScheduledEvent } from '../ports';
import { createInjectionToken } from '@trackflix-live/di';

export class EventSchedulerFake implements EventScheduler {
  public readonly scheduledEvents: ScheduledEvent[] = [];

  public async scheduleEvent(scheduledEvent: ScheduledEvent) {
    this.scheduledEvents.push(scheduledEvent);
  }

  public async deleteSchedule(eventId: string) {
    this.scheduledEvents.splice(
      this.scheduledEvents.findIndex((event) => event.id === eventId),
      1
    );
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

export const tokenEventSchedulerDeleteFake =
  createInjectionToken<EventSchedulerFake>('EventSchedulerDeleteFake', {
    useClass: EventSchedulerFake,
  });
