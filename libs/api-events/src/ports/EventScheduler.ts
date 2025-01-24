export interface ScheduledEvent {
  time: Date;
  id: string;
}

export interface EventScheduler {
  scheduleEvent(args: ScheduledEvent): Promise<void>;
}
