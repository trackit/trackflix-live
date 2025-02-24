import {
  EventsRepository,
  EventUpdateSender,
  LiveChannelsManager,
  TaskTokensRepository,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';

export interface CreateLiveChannelParameters {
  eventId: string;
  packageChannelId: string;
  taskToken: string;
}

export interface CreateLiveChannelResponse {
  channelId: string;
  channelArn: string;
}

export interface CreateLiveChannelUseCase {
  createLiveChannel(
    params: CreateLiveChannelParameters
  ): Promise<CreateLiveChannelResponse>;
}

export class CreateLiveChannelUseCaseImpl implements CreateLiveChannelUseCase {
  private readonly eventsRepository: EventsRepository;

  private readonly liveChannelsManager: LiveChannelsManager;

  private readonly taskTokensRepository: TaskTokensRepository;

  private readonly eventUpdateSender: EventUpdateSender;

  public constructor({
    eventsRepository,
    liveChannelsManager,
    taskTokensRepository,
    eventUpdateSender,
  }: {
    eventsRepository: EventsRepository;
    liveChannelsManager: LiveChannelsManager;
    taskTokensRepository: TaskTokensRepository;
    eventUpdateSender: EventUpdateSender;
  }) {
    this.eventsRepository = eventsRepository;
    this.liveChannelsManager = liveChannelsManager;
    this.taskTokensRepository = taskTokensRepository;
    this.eventUpdateSender = eventUpdateSender;
  }

  public async createLiveChannel({
    eventId,
    packageChannelId,
    taskToken,
  }: CreateLiveChannelParameters): Promise<CreateLiveChannelResponse> {
    const event = await this.eventsRepository.getEvent(eventId);
    if (event === undefined) {
      throw new Error('Event not found.');
    }

    const liveChannel = await this.liveChannelsManager.createChannel({
      eventId: eventId,
      source: event.source,
      packageChannelId,
    });

    const currentTimestamp = Date.now();
    const eventAfterUpdate = await this.eventsRepository.appendLogsToEvent(
      eventId,
      [
        {
          timestamp: currentTimestamp,
          type: LogType.LIVE_INPUT_CREATED,
        },
      ]
    );

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: eventAfterUpdate,
    });

    await this.taskTokensRepository.createTaskToken({
      channelArn: liveChannel.channelArn,
      expectedStatus: 'CREATED',
      taskToken,
      output: {
        eventId,
        packageChannelId,
        liveChannelId: liveChannel.channelId,
        liveChannelArn: liveChannel.channelArn,
      },
    });

    return liveChannel;
  }
}
