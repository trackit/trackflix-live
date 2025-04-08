import { tokenDeleteCDNOriginUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';

export class DeleteCloudFrontOriginAdapter {
  private readonly useCase = inject(tokenDeleteCDNOriginUseCase);

  public async handle(params: { eventId: string }): Promise<{
    eventId: string;
  }> {
    await this.useCase.deleteCDNOrigin({
      eventId: params.eventId,
    });

    return {
      eventId: params.eventId,
    };
  }
}
