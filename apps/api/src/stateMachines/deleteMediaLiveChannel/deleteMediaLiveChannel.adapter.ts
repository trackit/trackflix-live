import { DeleteLiveChannelUseCase } from '@trackflix-live/api-events';

export class DeleteMediaLiveChannelAdapter {
  private readonly useCase: DeleteLiveChannelUseCase;

  public constructor({ useCase }: { useCase: DeleteLiveChannelUseCase }) {
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
    await this.useCase.deleteLiveChannel({
      eventId: params.input.eventId,
      taskToken: params.taskToken,
    });

    return {
      eventId: params.input.eventId,
    };
  }
}
