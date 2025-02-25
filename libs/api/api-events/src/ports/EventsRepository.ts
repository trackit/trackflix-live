import {
  Event,
  EventEndpoint,
  EventLog,
  EventStatus,
} from '@trackflix-live/types';
import { ListEventsParams } from '../useCases';

export interface ListEventsResponse {
  events: Event[];
  nextToken: string | null;
}

export interface EventsRepository {
  createEvent(event: Event): Promise<void>;
  listEvents(params: ListEventsParams): Promise<ListEventsResponse>;
  getEvent(eventId: string): Promise<Event | undefined>;
  appendLogsToEvent(eventId: string, logs: EventLog[]): Promise<Event>;
  appendEndpointsToEvent(
    eventId: string,
    endpoints: EventEndpoint[]
  ): Promise<Event>;
  updateEventStatus(eventId: string, status: EventStatus): Promise<Event>;
  updateLiveChannelId(eventId: string, liveChannelId: string): Promise<Event>;
  updateLiveChannelArn(eventId: string, liveChannelArn: string): Promise<Event>;
  updateLiveInputId(eventId: string, liveInputId: string): Promise<Event>;
  updateEventDestroyedTime(
    eventId: string,
    destroyedTime: string
  ): Promise<Event>;
}
