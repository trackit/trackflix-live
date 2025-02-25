import { Event } from './types';

export type CreateEventRequest = {
  body: Pick<
    Event,
    'name' | 'description' | 'onAirStartTime' | 'onAirEndTime' | 'source'
  >;
};
export type CreateEventResponse = { body: { event: Event } };

export type ListEventsRequest = {
  queryStringParameters: {
    limit?: string;
    nextToken?: string;
    sortBy?: 'name' | 'onAirStartTime' | 'onAirEndTime' | 'status';
    sortOrder?: 'asc' | 'desc';
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

export interface AttachIotPolicyRequest {
  body: {
    identityId: string;
  };
}
export type AttachIotPolicyResponse = {
  body: {
    status: 'Ok';
  };
};
