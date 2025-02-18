import { EventBridgeEvent } from 'aws-lambda';
import { HandleLiveChannelStateChangeUseCase } from '@trackflix-live/api-events';

export class HandleMediaLiveChannelStateChangeAdapter {
  private readonly useCase: HandleLiveChannelStateChangeUseCase;

  public constructor({
    useCase,
  }: {
    useCase: HandleLiveChannelStateChangeUseCase;
  }) {
    this.useCase = useCase;
  }

  public async handle(
    event: EventBridgeEvent<
      'MediaLive Channel State Change',
      {
        channel_arn: string;
        state: 'CREATED' | 'RUNNING' | 'STOPPING' | 'STOPPED';
      }
    >
  ): Promise<void> {
    await this.useCase.handleLiveChannelStateChange({
      channelArn: event.detail.channel_arn,
      state: event.detail.state,
    });
  }
}
