import { StopLiveChannelUseCase } from '@trackflix-live/api-events';

export class StopMediaLiveChannelAdapter {
  private readonly useCase: StopLiveChannelUseCase;

  public constructor({ useCase }: { useCase: StopLiveChannelUseCase }) {
    this.useCase = useCase;
  }

  public async handle(params: {
    input: {
      eventId: string;
    };
    taskToken: string;
  }): Promise<{
    eventId: string;
  }> {
    await this.useCase.stopLiveChannel({
      eventId: params.input.eventId,
      taskToken: params.taskToken,
    });

    return {
      eventId: params.input.eventId,
    };
  }
}
