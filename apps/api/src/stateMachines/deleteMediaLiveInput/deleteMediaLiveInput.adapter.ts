import { DeleteLiveInputUseCase } from '@trackflix-live/api-events';

export class DeleteMediaLiveInputAdapter {
  private readonly useCase: DeleteLiveInputUseCase;

  public constructor({ useCase }: { useCase: DeleteLiveInputUseCase }) {
    this.useCase = useCase;
  }

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
