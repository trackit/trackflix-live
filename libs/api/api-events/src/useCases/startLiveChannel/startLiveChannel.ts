import { LiveChannelsManager, TaskTokensRepository } from '../../ports';

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

  public constructor({
    liveChannelsManager,
    taskTokensRepository,
  }: {
    liveChannelsManager: LiveChannelsManager;
    taskTokensRepository: TaskTokensRepository;
  }) {
    this.liveChannelsManager = liveChannelsManager;
    this.taskTokensRepository = taskTokensRepository;
  }

  public async startLiveChannel({
    liveChannelId,
    liveChannelArn,
    packageChannelId,
    eventId,
    taskToken,
  }: StartLiveChannelParameters): Promise<void> {
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
