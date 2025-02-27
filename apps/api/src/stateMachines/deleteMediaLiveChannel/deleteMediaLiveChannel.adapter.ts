import { tokenDeleteLiveChannelUseCase } from '@trackflix-live/api-events';
import { inject } from 'di';

export class DeleteMediaLiveChannelAdapter {
  private readonly useCase = inject(tokenDeleteLiveChannelUseCase);

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
