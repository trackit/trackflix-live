import { tokenEventSchedulerDelete, tokenEventsRepository } from '../../ports';
import { EventStatus } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils';

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

export interface DeleteEventUseCase {
  deleteEvent(eventId: string): Promise<void>;
}

export class DeleteEventUseCaseImpl implements DeleteEventUseCase {
  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly eventSchedulerDelete = inject(tokenEventSchedulerDelete);

  public async deleteEvent(eventId: string): Promise<void> {
    const event = await this.eventsRepository.getEvent(eventId);

    if (!event) {
      throw new EventDoesNotExistError();
    }
    if (event.status !== EventStatus.PRE_TX) {
      throw new EventCannotBeDeletedIfNotOnPreTxError();
    }

    const currentDate = Date.now();
    const onAirStartTime = new Date(event.onAirStartTime);
    const onAirEndTime = new Date(event.onAirEndTime);
    if (
      currentDate >= onAirStartTime.getTime() &&
      currentDate <= onAirEndTime.getTime()
    ) {
      throw new EventCannotBeDeletedWhileOnAirError();
    }

    await this.eventSchedulerDelete.deleteSchedule(
      `TrackflixLiveStartTx-${eventId}`
    );
    await this.eventSchedulerDelete.deleteSchedule(
      `TrackflixLiveStopTx-${eventId}`
    );

    await this.eventsRepository.deleteEvent(eventId);
  }
}

export const tokenDeleteEventUseCase = createInjectionToken<DeleteEventUseCase>(
  'DeleteEventUseCase',
  {
    useClass: DeleteEventUseCaseImpl,
  }
);
