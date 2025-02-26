export interface ScheduledEvent {
  time: Date;
  id: string;
  name: string;
}

export interface EventScheduler {
  scheduleEvent(args: ScheduledEvent): Promise<void>;
}
