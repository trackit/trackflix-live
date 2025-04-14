import { randomUUID } from 'node:crypto';
import {
  tokenAssetsService,
  tokenEventSchedulerStart,
  tokenEventSchedulerStop,
  tokenEventsRepository,
  tokenEventUpdateSender,
} from '../../ports';
import { Event, EventStatus, EventUpdateAction } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';
import { AuthorizationError } from '../../utils';

export type CreateEventArgs = Pick<
  Event,
  'name' | 'description' | 'onAirStartTime' | 'onAirEndTime' | 'source'
>;

export class AssetNotFoundError extends Error {
  constructor() {
    super('Asset not found');
  }
}

export interface CreateEventUseCase {
  createEvent(args: CreateEventArgs, userGroups: string[]): Promise<Event>;
}

export class CreateEventUseCaseImpl implements CreateEventUseCase {
  private readonly eventSchedulerStart = inject(tokenEventSchedulerStart);

  private readonly eventSchedulerStop = inject(tokenEventSchedulerStop);

  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  private readonly assetsService = inject(tokenAssetsService);

  public async createEvent(args: CreateEventArgs, userGroups: string[]): Promise<Event> {
    if (!userGroups.includes('Creators')) {
      throw new AuthorizationError();
    }

    const id = randomUUID();

    const event = {
      ...args,
      id,
      createdTime: new Date().toISOString(),
      logs: [],
      endpoints: [],
      status: EventStatus.PRE_TX,
    } satisfies Event;

    if (!(await this.assetsService.assetExists(event.source))) {
      throw new AssetNotFoundError();
    }

    await this.eventsRepository.createEvent(event);

    const preTxTime = new Date(event.onAirStartTime);
    preTxTime.setMinutes(preTxTime.getMinutes() - 5);

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
