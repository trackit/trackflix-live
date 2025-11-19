import { ApiBaseClient } from './api-base-client';
import { EventsRepository } from './events-repository';
import {
  CreateEventRequest,
  CreateEventResponse,
  DeleteEventResponse,
  GetEventResponse,
  ListEventsRequest,
  ListEventsResponse,
} from '@trackflix-live/types';

export class EventsRepositoryApi
  extends ApiBaseClient
  implements EventsRepository
{
  public async createEvent(
    request: CreateEventRequest['body']
  ): Promise<CreateEventResponse['body']> {
    return this.post<CreateEventResponse['body']>('/event', {
      name: request.name,
      description: request.description,
      onAirStartTime: request.onAirStartTime,
      onAirEndTime: request.onAirEndTime,
      source: request.source,
    });
  }

  public async deleteEvent(
    eventId: string
  ): Promise<DeleteEventResponse['body']> {
    return this.delete<DeleteEventResponse['body']>(`/event/${eventId}`);
  }

  public async getEvent(eventId: string): Promise<GetEventResponse['body']> {
    return this.get<GetEventResponse['body']>(`/event/${eventId}`);
  }

  public async listEvents(
    input: ListEventsRequest
  ): Promise<ListEventsResponse['body']> {
    const searchParams = new URLSearchParams();
    if (input.queryStringParameters.limit) {
      searchParams.set('limit', input.queryStringParameters.limit);
    }
    if (input.queryStringParameters.nextToken) {
      searchParams.set('nextToken', input.queryStringParameters.nextToken);
    }
    if (input.queryStringParameters.sortBy) {
      searchParams.set('sortBy', input.queryStringParameters.sortBy);
    }
    if (input.queryStringParameters.sortOrder) {
      searchParams.set('sortOrder', input.queryStringParameters.sortOrder);
    }
    if (
      input.queryStringParameters.name &&
      input.queryStringParameters.name !== ''
    ) {
      searchParams.set('name', input.queryStringParameters.name);
    }
    // Clear sortOrder if sortBy is not provided
    if (!input.queryStringParameters.sortBy) {
      searchParams.delete('sortOrder');
    }

    return this.get<ListEventsResponse['body']>(
      `/events?${searchParams.toString()}`
    );
  }
}
