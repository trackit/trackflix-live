import { Event } from './types';

export type CreateEventRequest = Omit<Event, 'id' | 'status'>;
export type CreateEventResponse = Event;

export type ListEventsRequest = {
  limit?: number;
  nextToken?: number;
};
export type ListEventsResponse = {
  events: Event[];
  nextToken?: string;
};

export type GetEventRequest = {
  id: string;
};
export type GetEventResponse = Event;
