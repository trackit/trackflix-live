import { Event, ListEventsResponse } from '@trackflix-live/types';

export function adapt(listEventResponse: ListEventsResponse['body']): {
  events: Event[];
  nextToken?: string;
} {
  return {
    events: listEventResponse.events,
    nextToken: listEventResponse.nextToken || undefined,
  };
}
