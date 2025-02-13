import { StartLiveChannelUseCase } from '@trackflix-live/api-events';

export class StartMediaLiveChannelAdapter {
  private readonly useCase: StartLiveChannelUseCase;

  public constructor({ useCase }: { useCase: StartLiveChannelUseCase }) {
    this.useCase = useCase;
  }

  public async handle(params: {
    input: {
      eventId: string;
      packageChannelId: string;
      liveChannelId: string;
      liveChannelArn: string;
    };
    taskToken: string;
  }): Promise<{
    eventId: string;
    packageChannelId: string;
    liveChannelId: string;
    liveChannelArn: string;
  }> {
    await this.useCase.startLiveChannel({
      eventId: params.input.eventId,
      packageChannelId: params.input.packageChannelId,
      liveChannelId: params.input.liveChannelId,
      liveChannelArn: params.input.liveChannelArn,
      taskToken: params.taskToken,
    });

    return {
      eventId: params.input.eventId,
      packageChannelId: params.input.packageChannelId,
      liveChannelId: params.input.liveChannelId,
      liveChannelArn: params.input.liveChannelArn,
    };
  }
}
