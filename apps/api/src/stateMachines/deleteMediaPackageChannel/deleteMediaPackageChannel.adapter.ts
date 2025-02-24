import { DeletePackageChannelUseCase } from '@trackflix-live/api-events';

export class DeleteMediaPackageChannelAdapter {
  private readonly useCase: DeletePackageChannelUseCase;

  public constructor({ useCase }: { useCase: DeletePackageChannelUseCase }) {
    this.useCase = useCase;
  }

  public async handle(params: { eventId: string }): Promise<{
    eventId: string;
  }> {
    await this.useCase.deletePackageChannel({
      eventId: params.eventId,
    });

    return {
      eventId: params.eventId,
    };
  }
}
