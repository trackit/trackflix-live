import {
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenLiveChannelsManager,
  tokenTaskTokensRepository,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';
import { inject } from 'di';

export interface DeleteLiveChannelParameters {
  eventId: string;
  taskToken: string;
}

export interface DeleteLiveChannelUseCase {
  deleteLiveChannel(params: DeleteLiveChannelParameters): Promise<void>;
}

export class DeleteLiveChannelUseCaseImpl implements DeleteLiveChannelUseCase {
  private readonly liveChannelsManager = inject(tokenLiveChannelsManager);

  private readonly taskTokensRepository = inject(tokenTaskTokensRepository);

  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  public async deleteLiveChannel({
    eventId,
    taskToken,
  }: DeleteLiveChannelParameters): Promise<void> {
    const event = await this.eventsRepository.getEvent(eventId);
    if (event === undefined) {
      throw new Error('Event not found.');
    }
    if (
      event.liveChannelId === undefined ||
      event.liveChannelArn === undefined
    ) {
      throw new Error('Missing live channel ID or live channel ARN.');
    }

    const currentTimestamp = Date.now();
    const eventAfterUpdate = await this.eventsRepository.appendLogsToEvent(
      eventId,
      [
        {
          timestamp: currentTimestamp,
          type: LogType.LIVE_CHANNEL_STOPPED,
        },
      ]
    );
    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: eventAfterUpdate,
    });

    const { liveChannelArn, liveChannelId } = event;

    await this.liveChannelsManager.deleteChannel(liveChannelId);

    await this.taskTokensRepository.createTaskToken({
      channelArn: liveChannelArn,
      expectedStatus: 'DELETED',
      taskToken,
      output: {
        eventId,
      },
    });
  }
}
