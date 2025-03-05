import { tokenEventsRepository, tokenEventUpdateSender } from '../../ports';
import { EventStatus, EventUpdateAction, LogType } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';

export interface SetErrorStatusUseCase {
  setErrorStatus(eventId: string): Promise<void>;
}

export class SetErrorStatusUseCaseImpl implements SetErrorStatusUseCase {
  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  private readonly eventsRepository = inject(tokenEventsRepository);

  public async setErrorStatus(eventId: string): Promise<void> {
    await this.eventsRepository.updateEventStatus(eventId, EventStatus.ERROR);

    const event = await this.eventsRepository.appendLogsToEvent(eventId, [
      {
        timestamp: Date.now(),
        type: LogType.EVENT_ERROR_OCCURED,
      },
    ]);

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: event,
    });
  }
}

export const tokenSetErrorStatusUseCase =
  createInjectionToken<SetErrorStatusUseCase>('SetErrorStatusUseCase', {
    useClass: SetErrorStatusUseCaseImpl,
  });
