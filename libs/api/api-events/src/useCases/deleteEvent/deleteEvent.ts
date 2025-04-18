import { tokenEventSchedulerDelete, tokenEventsRepository } from '../../ports';
import { EventStatus } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';
import { AuthorizationError, EventDoesNotExistError } from '../../utils';

export class EventCannotBeDeletedIfNotOnPreTxError extends Error {
  constructor() {
    super('Event cannot be deleted if not on pre tx');
  }
}

export class EventCannotBeDeletedWhileOnAirError extends Error {
  constructor() {
    super('Cannot delete event while it is on air');
  }
}

export type DeleteEventArgs = { eventId: string; userGroups: string[] };

export interface DeleteEventUseCase {
  deleteEvent(args: DeleteEventArgs): Promise<void>;
}

export class DeleteEventUseCaseImpl implements DeleteEventUseCase {
  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly eventSchedulerDelete = inject(tokenEventSchedulerDelete);

  public async deleteEvent(args: DeleteEventArgs): Promise<void> {
    if (!args.userGroups.includes('Creators')) {
      throw new AuthorizationError();
    }

    const event = await this.eventsRepository.getEvent(args.eventId);

    if (!event) {
      throw new EventDoesNotExistError();
    }
    if (event.status !== EventStatus.PRE_TX) {
      throw new EventCannotBeDeletedIfNotOnPreTxError();
    }

    const currentDate = Date.now();
    const onAirStartTime = new Date(event.onAirStartTime);
    onAirStartTime.setMinutes(onAirStartTime.getMinutes() - 6);
    const onAirEndTime = new Date(event.onAirEndTime);

    if (
      currentDate >= onAirStartTime.getTime() &&
      currentDate <= onAirEndTime.getTime()
    ) {
      throw new EventCannotBeDeletedWhileOnAirError();
    }

    await this.eventSchedulerDelete.deleteSchedule(
      `TrackflixLiveStartTx-${args.eventId}`
    );
    await this.eventSchedulerDelete.deleteSchedule(
      `TrackflixLiveStopTx-${args.eventId}`
    );

    await this.eventsRepository.deleteEvent(args.eventId);
  }
}

export const tokenDeleteEventUseCase = createInjectionToken<DeleteEventUseCase>(
  'DeleteEventUseCase',
  {
    useClass: DeleteEventUseCaseImpl,
  }
);
