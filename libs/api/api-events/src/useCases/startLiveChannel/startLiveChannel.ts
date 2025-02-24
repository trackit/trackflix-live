import {
  EventsRepository,
  EventUpdateSender,
  LiveChannelsManager,
  TaskTokensRepository,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';

export interface StartLiveChannelParameters {
  eventId: string;
  packageChannelId: string;
  liveChannelArn: string;
  liveChannelId: string;
  taskToken: string;
}

export interface StartLiveChannelUseCase {
  startLiveChannel(params: StartLiveChannelParameters): Promise<void>;
}

export class StartLiveChannelUseCaseImpl implements StartLiveChannelUseCase {
  private readonly liveChannelsManager: LiveChannelsManager;

  private readonly taskTokensRepository: TaskTokensRepository;

  private readonly eventUpdateSender: EventUpdateSender;

  private readonly eventsRepository: EventsRepository;

  public constructor({
    liveChannelsManager,
    taskTokensRepository,
    eventUpdateSender,
    eventsRepository,
  }: {
    liveChannelsManager: LiveChannelsManager;
    taskTokensRepository: TaskTokensRepository;
    eventUpdateSender: EventUpdateSender;
    eventsRepository: EventsRepository;
  }) {
    this.liveChannelsManager = liveChannelsManager;
    this.taskTokensRepository = taskTokensRepository;
    this.eventUpdateSender = eventUpdateSender;
    this.eventsRepository = eventsRepository;
  }

  public async startLiveChannel({
    liveChannelId,
    liveChannelArn,
    packageChannelId,
    eventId,
    taskToken,
  }: StartLiveChannelParameters): Promise<void> {
    const event = await this.eventsRepository.appendLogsToEvent(eventId, [
      {
        timestamp: Date.now(),
        type: LogType.LIVE_CHANNEL_CREATED,
      },
    ]);
    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: event,
    });

    await this.liveChannelsManager.startChannel(liveChannelId);

    await this.taskTokensRepository.createTaskToken({
      channelArn: liveChannelArn,
      expectedStatus: 'RUNNING',
      taskToken,
      output: {
        eventId,
        packageChannelId,
        liveChannelId,
        liveChannelArn,
      },
    });
  }
}
