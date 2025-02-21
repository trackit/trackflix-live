import { EventsRepository, EventUpdateSender } from '../../ports';
import { EventStatus, EventUpdateAction, LogType } from '@trackflix-live/types';

export interface SaveResultsUseCase {
  saveResults(eventId: string): Promise<void>;
}

export class SaveResultsUseCaseImpl implements SaveResultsUseCase {
  private readonly eventUpdateSender: EventUpdateSender;

  private readonly eventsRepository: EventsRepository;

  public constructor({
    eventUpdateSender,
    eventsRepository,
  }: {
    eventUpdateSender: EventUpdateSender;
    eventsRepository: EventsRepository;
  }) {
    this.eventUpdateSender = eventUpdateSender;
    this.eventsRepository = eventsRepository;
  }

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
