import { tokenDeletePackageChannelUseCase } from '@trackflix-live/api-events';
import { inject } from 'di';

export class DeleteMediaPackageChannelAdapter {
  private readonly useCase = inject(tokenDeletePackageChannelUseCase);

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
