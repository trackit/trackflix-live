import { createInjectionToken } from '@trackflix-live/di';

export interface ScheduledEvent {
  time: Date;
  id: string;
  name: string;
}

export interface EventScheduler {
  scheduleEvent(args: ScheduledEvent): Promise<void>;
  deleteSchedule(eventId: string): Promise<void>;
}

export const tokenEventSchedulerStart = createInjectionToken<EventScheduler>(
  'EventSchedulerStart'
);

export const tokenEventSchedulerStop =
  createInjectionToken<EventScheduler>('EventSchedulerStop');

export const tokenEventSchedulerDelete = createInjectionToken<EventScheduler>(
  'EventSchedulerDelete'
);
