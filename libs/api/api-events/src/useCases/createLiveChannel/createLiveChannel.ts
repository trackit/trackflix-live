import {
  EventsRepository,
  LiveChannelsManager,
  TaskTokensRepository,
} from '../../ports';

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

  public constructor({
    eventsRepository,
    liveChannelsManager,
    taskTokensRepository,
  }: {
    eventsRepository: EventsRepository;
    liveChannelsManager: LiveChannelsManager;
    taskTokensRepository: TaskTokensRepository;
  }) {
    this.eventsRepository = eventsRepository;
    this.liveChannelsManager = liveChannelsManager;
    this.taskTokensRepository = taskTokensRepository;
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
