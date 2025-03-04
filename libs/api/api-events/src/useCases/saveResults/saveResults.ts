import { tokenEventsRepository, tokenEventUpdateSender } from '../../ports';
import { EventUpdateAction, LogType, Event } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';
export interface SaveResultsUseCase {
  saveResults(eventId: string): Promise<Event>;
}

export class SaveResultsUseCaseImpl implements SaveResultsUseCase {
  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  private readonly eventsRepository = inject(tokenEventsRepository);

  public async saveResults(eventId: string): Promise<Event> {
    const event = await this.eventsRepository.appendLogsToEvent(eventId, [
      {
        timestamp: Date.now(),
        type: LogType.LIVE_CHANNEL_STARTED,
      },
    ]);

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: event,
    });

    return event;
  }
}

export const tokenSaveResultsUseCase = createInjectionToken<SaveResultsUseCase>(
  'SaveResultsUseCase',
  { useClass: SaveResultsUseCaseImpl }
);
