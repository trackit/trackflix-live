import { randomUUID } from 'node:crypto';
import { EventScheduler, EventsRepository } from '../../ports';
import { Event, EventStatus } from '@trackflix-live/types';

export type CreateEventArgs = Omit<Event, 'id' | 'status'>;

export interface CreateEventUseCase {
  createEvent(args: CreateEventArgs): Promise<Event>;
}

export class CreateEventUseCaseImpl implements CreateEventUseCase {
  private readonly eventScheduler: EventScheduler;

  private readonly eventsRepository: EventsRepository;

  public constructor({
    eventScheduler,
    eventsRepository,
  }: {
    eventScheduler: EventScheduler;
    eventsRepository: EventsRepository;
  }) {
    this.eventScheduler = eventScheduler;
    this.eventsRepository = eventsRepository;
  }

  public async createEvent(args: CreateEventArgs): Promise<Event> {
    const id = randomUUID();

    const event = {
      ...args,
      id,
      status: EventStatus.PRE_TX,
    } satisfies Event;

    await this.eventsRepository.createEvent(event);

    const preTxTime = new Date(event.onAirStartTime);
    preTxTime.setHours(preTxTime.getHours() - 1);

    await this.eventScheduler.scheduleEvent({
      id,
      time: preTxTime,
    });

    return event;
  }
}
