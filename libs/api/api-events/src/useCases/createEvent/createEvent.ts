import { randomUUID } from 'node:crypto';
import { EventScheduler, EventsRepository } from '../../ports';
import { Event, EventStatus, EventUpdateAction } from '@trackflix-live/types';
import { EventUpdateSender } from '../../ports/EventUpdateSender';

export type CreateEventArgs = Omit<
  Event,
  'id' | 'status' | 'createdTime' | 'logs' | 'endpoints'
>;

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
      createdTime: new Date().toISOString(),
      logs: [],
      endpoints: [],
      status: EventStatus.PRE_TX,
    } satisfies Event;

    await this.eventsRepository.createEvent(event);

    const preTxTime = new Date(event.onAirStartTime);
    preTxTime.setMinutes(preTxTime.getMinutes() - 15);

    await this.eventScheduler.scheduleEvent({
      id,
      time: preTxTime,
    });

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_CREATE,
      value: event,
    });

    return event;
  }
}
