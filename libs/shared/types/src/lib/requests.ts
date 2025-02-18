import { Event } from './types';

export type CreateEventRequest = {
  body: Omit<Event, 'id' | 'status'>;
};
export type CreateEventResponse = { body: { event: Event } };

export type ListEventsRequest = {
  queryStringParameters: {
    limit?: string;
    nextToken?: string;
  };
};
export type ListEventsResponse = {
  body: {
    events: Event[];
    nextToken: string | null;
  };
};

export type GetEventRequest = {
  pathParameters: { eventId: string };
};
export type GetEventResponse = { body: { event: Event } };
