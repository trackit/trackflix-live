import { randomUUID } from 'node:crypto';
import { EventScheduler, EventsRepository } from '../../ports';
import { Event, EventStatus, EventUpdateAction } from '@trackflix-live/types';
import { EventUpdateSender } from '../../ports/EventUpdateSender';

export type CreateEventArgs = Pick<
  Event,
  'name' | 'description' | 'onAirStartTime' | 'onAirEndTime' | 'source'
>;

export interface CreateEventUseCase {
  createEvent(args: CreateEventArgs): Promise<Event>;
}

export class CreateEventUseCaseImpl implements CreateEventUseCase {
  private readonly eventSchedulerStart: EventScheduler;

  private readonly eventSchedulerStop: EventScheduler;

  private readonly eventsRepository: EventsRepository;

  private readonly eventUpdateSender: EventUpdateSender;

  public constructor({
    eventSchedulerStart,
    eventSchedulerStop,
    eventsRepository,
    eventUpdateSender,
  }: {
    eventSchedulerStart: EventScheduler;
    eventSchedulerStop: EventScheduler;
    eventsRepository: EventsRepository;
    eventUpdateSender: EventUpdateSender;
  }) {
    this.eventSchedulerStart = eventSchedulerStart;
    this.eventSchedulerStop = eventSchedulerStop;
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

    await this.eventSchedulerStart.scheduleEvent({
      id,
      time: preTxTime,
      name: 'TrackflixLiveStartTx',
    });

    await this.eventSchedulerStop.scheduleEvent({
      id,
      time: new Date(event.onAirEndTime),
      name: 'TrackflixLiveStopTx',
    });

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_CREATE,
      value: event,
    });

    return event;
  }
}
