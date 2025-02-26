import {
  EventsRepository,
  EventUpdateSender,
  LiveChannelsManager,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';

export interface DeleteLiveInputParameters {
  eventId: string;
}

export interface DeleteLiveInputUseCase {
  deleteLiveInput(params: DeleteLiveInputParameters): Promise<void>;
}

export class DeleteLiveInputUseCaseImpl implements DeleteLiveInputUseCase {
  private readonly liveChannelsManager: LiveChannelsManager;

  private readonly eventsRepository: EventsRepository;

  private readonly eventUpdateSender: EventUpdateSender;

  public constructor({
    liveChannelsManager,
    eventsRepository,
    eventUpdateSender,
  }: {
    liveChannelsManager: LiveChannelsManager;
    eventsRepository: EventsRepository;
    eventUpdateSender: EventUpdateSender;
  }) {
    this.liveChannelsManager = liveChannelsManager;
    this.eventsRepository = eventsRepository;
    this.eventUpdateSender = eventUpdateSender;
  }

  public async deleteLiveInput({
    eventId,
  }: DeleteLiveInputParameters): Promise<void> {
    const event = await this.eventsRepository.getEvent(eventId);
    if (event === undefined) {
      throw new Error('Event not found.');
    }
    if (event.liveInputId === undefined) {
      throw new Error('Missing live input ID.');
    }

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: await this.eventsRepository.appendLogsToEvent(eventId, [
        {
          timestamp: Date.now(),
          type: LogType.LIVE_CHANNEL_DESTROYED,
        },
      ]),
    });

    const { liveInputId } = event;

    await this.liveChannelsManager.deleteInput(liveInputId);

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: await this.eventsRepository.appendLogsToEvent(eventId, [
        {
          timestamp: Date.now(),
          type: LogType.LIVE_INPUT_DESTROYED,
        },
      ]),
    });
  }
}
