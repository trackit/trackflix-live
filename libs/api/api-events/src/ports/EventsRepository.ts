import { Event, EventLog } from '@trackflix-live/types';

export interface ListEventsResponse {
  events: Event[];
  nextToken: string | null;
}

export interface EventsRepository {
  createEvent(event: Event): Promise<void>;
  listEvents(limit: number, nextToken?: string): Promise<ListEventsResponse>;
  getEvent(eventId: string): Promise<Event | undefined>;
  appendLogToEvent(eventId: string, log: EventLog): Promise<Event>;
}
