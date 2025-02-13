import { TaskTokensRepository, TransmissionsManager } from '../../ports';

export interface HandleLiveChannelStateChangeParameters {
  channelArn: string;
  state: 'CREATED' | 'RUNNING' | 'STOPPING' | 'STOPPED';
}

export interface HandleLiveChannelStateChangeUseCase {
  handleLiveChannelStateChange(
    params: HandleLiveChannelStateChangeParameters
  ): Promise<void>;
}

export class HandleLiveChannelStateChangeUseCaseImpl
  implements HandleLiveChannelStateChangeUseCase
{
  private readonly taskTokensRepository: TaskTokensRepository;

  private readonly transmissionsManager: TransmissionsManager;

  public constructor({
    taskTokensRepository,
    transmissionsManager,
  }: {
    taskTokensRepository: TaskTokensRepository;
    transmissionsManager: TransmissionsManager;
  }) {
    this.taskTokensRepository = taskTokensRepository;
    this.transmissionsManager = transmissionsManager;
  }

  public async handleLiveChannelStateChange({
    channelArn,
    state,
  }: HandleLiveChannelStateChangeParameters): Promise<void> {
    const taskToken = await this.taskTokensRepository.consumeTaskToken({
      channelArn,
      expectedStatus: state,
    });
    if (taskToken === undefined) {
      return;
    }

    await this.transmissionsManager.resumeStartTransmission(taskToken);
  }
}
