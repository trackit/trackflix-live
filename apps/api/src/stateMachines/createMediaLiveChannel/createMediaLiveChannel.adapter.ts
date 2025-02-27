import { tokenCreateLiveChannelUseCase } from '@trackflix-live/api-events';
import { inject } from 'di';

export class CreateMediaLiveChannelAdapter {
  private readonly useCase = inject(tokenCreateLiveChannelUseCase);

  public async handle(params: {
    input: {
      eventId: string;
      packageChannelId: string;
    };
    taskToken: string;
  }): Promise<{
    eventId: string;
    packageChannelId: string;
    liveChannelId: string;
    liveChannelArn: string;
  }> {
    const liveChannel = await this.useCase.createLiveChannel({
      eventId: params.input.eventId,
      packageChannelId: params.input.packageChannelId,
      taskToken: params.taskToken,
    });

    return {
      eventId: params.input.eventId,
      packageChannelId: params.input.packageChannelId,
      liveChannelArn: liveChannel.channelArn,
      liveChannelId: liveChannel.channelId,
    };
  }
}
