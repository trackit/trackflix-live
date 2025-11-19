import {
  CreateEventRequest,
  CreateEventResponse,
  DeleteEventResponse,
  GetEventResponse,
  ListEventsRequest,
  ListEventsResponse,
} from '@trackflix-live/types';

export interface EventsRepository {
  deleteEvent(eventId: string): Promise<DeleteEventResponse['body']>;
  getEvent(eventId: string): Promise<GetEventResponse['body']>;
  listEvents(request: ListEventsRequest): Promise<ListEventsResponse['body']>;
  createEvent(
    request: CreateEventRequest['body']
  ): Promise<CreateEventResponse['body']>;
}
