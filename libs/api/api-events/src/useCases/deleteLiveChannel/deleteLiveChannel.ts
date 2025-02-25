import {
  EventsRepository,
  EventUpdateSender,
  LiveChannelsManager,
  TaskTokensRepository,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';

export interface DeleteLiveChannelParameters {
  eventId: string;
  taskToken: string;
}

export interface DeleteLiveChannelUseCase {
  deleteLiveChannel(params: DeleteLiveChannelParameters): Promise<void>;
}

export class DeleteLiveChannelUseCaseImpl implements DeleteLiveChannelUseCase {
  private readonly liveChannelsManager: LiveChannelsManager;

  private readonly taskTokensRepository: TaskTokensRepository;

  private readonly eventsRepository: EventsRepository;

  private readonly eventUpdateSender: EventUpdateSender;

  public constructor({
    liveChannelsManager,
    taskTokensRepository,
    eventsRepository,
    eventUpdateSender,
  }: {
    liveChannelsManager: LiveChannelsManager;
    taskTokensRepository: TaskTokensRepository;
    eventsRepository: EventsRepository;
    eventUpdateSender: EventUpdateSender;
  }) {
    this.liveChannelsManager = liveChannelsManager;
    this.taskTokensRepository = taskTokensRepository;
    this.eventsRepository = eventsRepository;
    this.eventUpdateSender = eventUpdateSender;
  }

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
