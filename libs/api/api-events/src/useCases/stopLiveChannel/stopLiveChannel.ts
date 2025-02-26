import {
  EventsRepository,
  EventUpdateSender,
  LiveChannelsManager,
  TaskTokensRepository,
} from '../../ports';
import { EventStatus, EventUpdateAction } from '@trackflix-live/types';

export interface StopLiveChannelParameters {
  eventId: string;
  taskToken: string;
}

export interface StopLiveChannelUseCase {
  stopLiveChannel(params: StopLiveChannelParameters): Promise<void>;
}

export class StopLiveChannelUseCaseImpl implements StopLiveChannelUseCase {
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

  public async stopLiveChannel({
    eventId,
    taskToken,
  }: StopLiveChannelParameters): Promise<void> {
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

    const eventAfterUpdate = await this.eventsRepository.updateEventStatus(
      eventId,
      EventStatus.POST_TX
    );
    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: eventAfterUpdate,
    });

    const { liveChannelArn, liveChannelId } = event;

    await this.liveChannelsManager.stopChannel(liveChannelId);

    await this.taskTokensRepository.createTaskToken({
      channelArn: liveChannelArn,
      expectedStatus: 'STOPPED',
      taskToken,
      output: {
        eventId,
      },
    });
  }
}
