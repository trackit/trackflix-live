import { EventsRepository, ListEventsResponse } from '../ports';
import { Event } from '@trackflix-live/types';
import { randomUUID } from 'node:crypto';

export class EventsRepositoryInMemory implements EventsRepository {
  public readonly events: Event[] = [];

  async createEvent(event: Event): Promise<void> {
    this.events.push(event);
  }

  async listEvents(
    limit: number,
    nextToken?: string
  ): Promise<ListEventsResponse> {
    const token = this.events.length > limit ? randomUUID() : null;

    return {
      events: this.events.slice(0, limit),
      nextToken: token,
    };
  }
}
