import { randomUUID } from 'node:crypto';
import { EventScheduler, EventsRepository } from '../../ports';
import { Event, EventStatus, EventUpdate } from '@trackflix-live/types';
import { EventUpdateSender } from '../../ports/EventUpdateSender';

export type CreateEventArgs = Omit<Event, 'id' | 'status'>;

export interface CreateEventUseCase {
  createEvent(args: CreateEventArgs): Promise<Event>;
}

export class CreateEventUseCaseImpl implements CreateEventUseCase {
  private readonly eventScheduler: EventScheduler;

  private readonly eventsRepository: EventsRepository;

  private readonly eventUpdateSender: EventUpdateSender;

  public constructor({
    eventScheduler,
    eventsRepository,
    eventUpdateSender,
  }: {
    eventScheduler: EventScheduler;
    eventsRepository: EventsRepository;
    eventUpdateSender: EventUpdateSender;
  }) {
    this.eventScheduler = eventScheduler;
    this.eventsRepository = eventsRepository;
    this.eventUpdateSender = eventUpdateSender;
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

    await this.eventUpdateSender.send({
      action: 'EVENT_UPDATE_CREATE',
      value: event,
    });

    return event;
  }
}
