import { Event } from '../datastructures/Event';

export interface EventsRepository {
  createEvent(event: Event): Promise<void>;
}
