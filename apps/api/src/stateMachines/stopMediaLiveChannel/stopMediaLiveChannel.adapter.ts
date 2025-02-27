import { tokenStopLiveChannelUseCase } from '@trackflix-live/api-events';
import { inject } from 'di';

export class StopMediaLiveChannelAdapter {
  private readonly useCase = inject(tokenStopLiveChannelUseCase);

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
