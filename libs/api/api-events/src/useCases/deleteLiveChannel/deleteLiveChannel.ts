import {
  EventsRepository,
  LiveChannelsManager,
  TaskTokensRepository,
} from '../../ports';

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

  public constructor({
    liveChannelsManager,
    taskTokensRepository,
    eventsRepository,
  }: {
    liveChannelsManager: LiveChannelsManager;
    taskTokensRepository: TaskTokensRepository;
    eventsRepository: EventsRepository;
  }) {
    this.liveChannelsManager = liveChannelsManager;
    this.taskTokensRepository = taskTokensRepository;
    this.eventsRepository = eventsRepository;
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
