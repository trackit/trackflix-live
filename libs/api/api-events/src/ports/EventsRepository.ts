import { Event } from '@trackflix-live/types';

export interface EventsRepository {
  createEvent(event: Event): Promise<void>;
  listEvents(): Promise<Event[]>;
}
