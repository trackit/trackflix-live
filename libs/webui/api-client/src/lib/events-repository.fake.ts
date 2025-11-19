import {
  CreateEventRequest,
  CreateEventResponse,
  DeleteEventResponse,
  Event,
  EventStatus,
  GetEventResponse,
  ListEventsRequest,
  ListEventsResponse,
} from '@trackflix-live/types';
import { EventsRepository } from './events-repository';

export class EventsRepositoryFake implements EventsRepository {
  private idCounter = 0;

  private events: Event[] = [];

  public async deleteEvent(
    eventId: string
  ): Promise<DeleteEventResponse['body']> {
    this.events = this.events.filter((event) => event.id !== eventId);
    return { status: 'Ok' };
  }

  public async getEvent(eventId: string): Promise<GetEventResponse['body']> {
    const event = this.events.find((event) => event.id === eventId);
    if (event === undefined) {
      throw new Error('Event not found');
    }

    return { event };
  }

  public async listEvents(
    params: ListEventsRequest
  ): Promise<ListEventsResponse['body']> {
    const limit = params.queryStringParameters?.limit
      ? parseInt(params.queryStringParameters.limit, 10)
      : 10;
    const offset = params.queryStringParameters?.nextToken
      ? parseInt(params.queryStringParameters.nextToken, 10)
      : 0;

    const endIndex = offset + limit;
    const paginatedEvents = this.events.slice(offset, endIndex);

    const hasMore = endIndex < this.events.length;
    const nextToken = hasMore ? endIndex.toString() : null;

    return {
      events: paginatedEvents,
      nextToken,
    };
  }

  public async createEvent(
    request: CreateEventRequest['body']
  ): Promise<CreateEventResponse['body']> {
    const event: Event = {
      ...request,
      id: (this.idCounter++).toString(),
      createdTime: new Date(0).toISOString(),
      endpoints: [],
      logs: [],
      status: EventStatus.PRE_TX,
    };

    this.events.push(event);
    return { event };
  }

  public reset(): void {
    this.events = [];
  }
}
