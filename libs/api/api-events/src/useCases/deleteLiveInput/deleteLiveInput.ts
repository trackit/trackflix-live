import {
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenLiveChannelsManager,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';
import { inject } from 'di';

export interface DeleteLiveInputParameters {
  eventId: string;
}

export interface DeleteLiveInputUseCase {
  deleteLiveInput(params: DeleteLiveInputParameters): Promise<void>;
}

export class DeleteLiveInputUseCaseImpl implements DeleteLiveInputUseCase {
  private readonly liveChannelsManager = inject(tokenLiveChannelsManager);

  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

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
