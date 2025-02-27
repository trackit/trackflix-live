import {
  tokenTaskTokensRepository,
  tokenTransmissionsManager,
} from '../../ports';
import { createInjectionToken, inject } from '@trackflix-live/di';

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
  private readonly taskTokensRepository = inject(tokenTaskTokensRepository);

  private readonly transmissionsManager = inject(tokenTransmissionsManager);

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

export const tokenHandleLiveChannelStateChangeUseCase =
  createInjectionToken<HandleLiveChannelStateChangeUseCase>(
    'HandleLiveChannelStateChangeUseCase',
    { useClass: HandleLiveChannelStateChangeUseCaseImpl }
  );
