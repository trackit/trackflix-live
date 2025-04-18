import { EventsRepository, ListEventsResponse } from '../ports';
import {
  Event,
  EventEndpoint,
  EventLog,
  EventStatus,
} from '@trackflix-live/types';
import { ListEventsParams } from '../ports';
import { createInjectionToken } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../utils';

export class EventsRepositoryInMemory implements EventsRepository {
  public readonly events: Event[] = [];

  async createEvent(event: Event): Promise<void> {
    this.events.push(event);
  }

  async listEvents(params: ListEventsParams): Promise<ListEventsResponse> {
    const { limit, sortBy, sortOrder, nextToken, name } = params;
    let startIndex = 0;

    let transformedEvents = this.events;
    if (sortBy) {
      transformedEvents = transformedEvents.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'onAirStartTime':
            return (
              new Date(a.onAirStartTime).getTime() -
              new Date(b.onAirStartTime).getTime()
            );
          case 'onAirEndTime':
            return (
              new Date(a.onAirEndTime).getTime() -
              new Date(b.onAirEndTime).getTime()
            );
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            break;
        }
        return 0;
      });
    }

    if (sortOrder === 'desc') {
      transformedEvents = transformedEvents.reverse();
    }

    if (name) {
      transformedEvents = transformedEvents.filter((event) =>
        event.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (nextToken) {
      startIndex =
        transformedEvents.findIndex((event) => event.id === nextToken) + 1;
      if (startIndex <= 0) {
        throw new Error('Invalid token');
      }
    }

    const events = transformedEvents.slice(startIndex, startIndex + limit);
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
      throw new EventDoesNotExistError();
    }

    event.logs.push(...logs);

    return event;
  }

  async updateEndpoints(eventId: string, endpoints: EventEndpoint[]): Promise<Event> {
    const event = this.events.find((event) => event.id === eventId);
    if (!event) {
      throw new EventDoesNotExistError();
    }

    event.endpoints = endpoints;

    return event;
  }

  async updateEventStatus(
    eventId: string,
    status: EventStatus
  ): Promise<Event> {
    const event = this.events.find((event) => event.id === eventId);
    if (!event) {
      throw new EventDoesNotExistError();
    }

    event.status = status;

    return event;
  }

  public async updateLiveChannelArn(
    eventId: string,
    liveChannelArn: string
  ): Promise<Event> {
    const event = this.events.find((event) => event.id === eventId);
    if (!event) {
      throw new EventDoesNotExistError();
    }

    event.liveChannelArn = liveChannelArn;

    return event;
  }

  public async updateLiveChannelId(
    eventId: string,
    liveChannelId: string
  ): Promise<Event> {
    const event = this.events.find((event) => event.id === eventId);
    if (!event) {
      throw new EventDoesNotExistError();
    }

    event.liveChannelId = liveChannelId;

    return event;
  }

  public async updateLiveInputId(
    eventId: string,
    liveInputId: string
  ): Promise<Event> {
    const event = this.events.find((event) => event.id === eventId);
    if (!event) {
      throw new EventDoesNotExistError();
    }

    event.liveInputId = liveInputId;

    return event;
  }

  public async updatePackageDomainName(
    eventId: string,
    packageDomainName: string
  ): Promise<Event> {
    const event = this.events.find((event) => event.id === eventId);
    if (!event) {
      throw new EventDoesNotExistError();
    }

    event.packageDomainName = packageDomainName;

    return event;
  }

  public async updateLiveWaitingInputId(
    eventId: string,
    liveWaitingInputId: string
  ): Promise<Event> {
    const event = this.events.find((event) => event.id === eventId);
    if (!event) {
      throw new EventDoesNotExistError();
    }

    event.liveWaitingInputId = liveWaitingInputId;

    return event;
  }

  public async updateEventDestroyedTime(
    eventId: string,
    destroyedTime: string
  ): Promise<Event> {
    const event = this.events.find((event) => event.id === eventId);
    if (!event) {
      throw new EventDoesNotExistError();
    }

    event.destroyedTime = destroyedTime;

    return event;
  }

  async deleteEvent(eventId: string): Promise<void> {
    const eventIndex = this.events.findIndex((event) => event.id === eventId);
    if (eventIndex === -1) {
      throw new EventDoesNotExistError();
    }

    this.events.splice(eventIndex, 1);
  }
}

export const tokenEventsRepositoryInMemory =
  createInjectionToken<EventsRepositoryInMemory>('EventsRepositoryInMemory', {
    useClass: EventsRepositoryInMemory,
  });
