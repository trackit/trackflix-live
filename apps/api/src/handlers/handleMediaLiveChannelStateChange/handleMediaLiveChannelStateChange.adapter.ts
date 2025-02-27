import { EventBridgeEvent } from 'aws-lambda';
import { tokenHandleLiveChannelStateChangeUseCase } from '@trackflix-live/api-events';
import { inject } from 'di';

export class HandleMediaLiveChannelStateChangeAdapter {
  private readonly useCase = inject(tokenHandleLiveChannelStateChangeUseCase);

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
