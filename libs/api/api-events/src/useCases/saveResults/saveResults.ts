import { tokenEventsRepository, tokenEventUpdateSender } from '../../ports';
import { EventStatus, EventUpdateAction, LogType } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';

export interface SaveResultsUseCase {
  saveResults(eventId: string): Promise<void>;
}

export class SaveResultsUseCaseImpl implements SaveResultsUseCase {
  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  private readonly eventsRepository = inject(tokenEventsRepository);

  public async saveResults(eventId: string): Promise<void> {
    await this.eventsRepository.appendLogsToEvent(eventId, [
      {
        timestamp: Date.now(),
        type: LogType.LIVE_CHANNEL_STARTED,
      },
    ]);

    const event = await this.eventsRepository.updateEventStatus(
      eventId,
      EventStatus.TX
    );

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: event,
    });
  }
}

export const tokenSaveResultsUseCase = createInjectionToken<SaveResultsUseCase>(
  'SaveResultsUseCase',
  { useClass: SaveResultsUseCaseImpl }
);
