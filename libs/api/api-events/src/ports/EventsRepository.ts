import { Event } from '@trackflix-live/types';

export interface ListEventsResponse {
  events: Event[];
  nextToken: string | null;
}

export interface EventsRepository {
  createEvent(event: Event): Promise<void>;
  listEvents(limit: number, nextToken?: string): Promise<ListEventsResponse>;
}
