import { EventsRepository, ListEventsResponse } from '../ports';
import { Event, EventEndpoint, EventLog } from '@trackflix-live/types';

export class EventsRepositoryInMemory implements EventsRepository {
  public readonly events: Event[] = [];

  async createEvent(event: Event): Promise<void> {
    this.events.push(event);
  }

  async listEvents(
    limit: number,
    nextToken?: string
  ): Promise<ListEventsResponse> {
    let startIndex = 0;

    if (nextToken) {
      startIndex = this.events.findIndex((event) => event.id === nextToken) + 1;
      if (startIndex <= 0) {
        throw new Error('Invalid token');
      }
    }

    const events = this.events.slice(startIndex, startIndex + limit);
    const lastEvaluatedKey =
      events.length === limit ? events[events.length - 1].id : null;

    return {
      events,
      nextToken: lastEvaluatedKey,
    };
  }

  async getEvent(eventId: string): Promise<Event | undefined> {
    return this.events.find((event) => event.id === eventId);
  }

  async appendLogsToEvent(eventId: string, logs: EventLog[]): Promise<Event> {
    const event = this.events.find((event) => event.id === eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    event.logs.push(...logs);

    return event;
  }

  async appendEndpointsToEvent(
    eventId: string,
    endpoints: EventEndpoint[]
  ): Promise<Event> {
    const event = this.events.find((event) => event.id === eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    event.endpoints.push(...endpoints);

    return event;
  }
}
