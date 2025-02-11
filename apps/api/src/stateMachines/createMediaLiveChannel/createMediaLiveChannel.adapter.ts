import { CreateLiveChannelUseCase } from '@trackflix-live/api-events';

export class CreateMediaLiveChannelAdapter {
  private readonly useCase: CreateLiveChannelUseCase;

  public constructor({ useCase }: { useCase: CreateLiveChannelUseCase }) {
    this.useCase = useCase;
  }

  public async handle(params: {
    input: {
      eventId: string;
      mediaPackageChannelId: string;
    };
    taskToken: string;
  }): Promise<{
    eventId: string;
    mediaPackageChannelId: string;
    mediaLiveChannelId: string;
    mediaLiveChannelArn: string;
  }> {
    const liveChannel = await this.useCase.createLiveChannel({
      eventId: params.input.eventId,
      packageChannelId: params.input.mediaPackageChannelId,
      taskToken: params.taskToken,
    });

    return {
      eventId: params.input.eventId,
      mediaPackageChannelId: params.input.mediaPackageChannelId,
      mediaLiveChannelArn: liveChannel.channelArn,
      mediaLiveChannelId: liveChannel.channelId,
    };
  }
}
