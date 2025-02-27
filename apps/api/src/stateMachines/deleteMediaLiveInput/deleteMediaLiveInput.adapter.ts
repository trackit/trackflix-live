import { tokenDeleteLiveInputUseCase } from '@trackflix-live/api-events';
import { inject } from 'di';

export class DeleteMediaLiveInputAdapter {
  private readonly useCase = inject(tokenDeleteLiveInputUseCase);

  public async handle(params: { eventId: string }): Promise<{
    eventId: string;
  }> {
    await this.useCase.deleteLiveInput({
      eventId: params.eventId,
    });

    return {
      eventId: params.eventId,
    };
  }
}
