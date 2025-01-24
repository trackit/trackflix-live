import { EventsRepository } from '../ports/EventsRepository';
import { Event } from '@trackflix-live/types';

export class EventsRepositoryInMemory implements EventsRepository {
  public readonly events: Event[] = [];

  async createEvent(event: Event): Promise<void> {
    this.events.push(event);
  }
}
