import { randomUUID } from 'node:crypto';
import {
  tokenEventSchedulerStart,
  tokenEventSchedulerStop,
  tokenEventsRepository,
  tokenEventUpdateSender,
} from '../../ports';
import { Event, EventStatus, EventUpdateAction } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';

export type CreateEventArgs = Pick<
  Event,
  'name' | 'description' | 'onAirStartTime' | 'onAirEndTime' | 'source'
>;

export interface CreateEventUseCase {
  createEvent(args: CreateEventArgs): Promise<Event>;
}

export class CreateEventUseCaseImpl implements CreateEventUseCase {
  private readonly eventSchedulerStart = inject(tokenEventSchedulerStart);

  private readonly eventSchedulerStop = inject(tokenEventSchedulerStop);

  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

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

export const tokenCreateEventUseCase = createInjectionToken<CreateEventUseCase>(
  'CreateEventUseCase',
  {
    useClass: CreateEventUseCaseImpl,
  }
);
