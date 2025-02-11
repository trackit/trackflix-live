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
    if (nextToken) {
      const index = this.events.findIndex((event) => event.id === nextToken);
      if (index === -1) {
        throw new Error('Invalid token');
      }

      return {
        events: this.events.slice(index, index + limit),
        nextToken:
          this.events.length > index + limit
            ? this.events[index + limit].id
            : null,
      };
    }

    return {
      events: this.events.slice(0, limit),
      nextToken: this.events.length > limit ? this.events[limit].id : null,
    };
  }
}
