import { tokenDeleteCDNOriginUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';

export class DeleteCloudFrontOriginAdapter {
  private readonly useCase = inject(tokenDeleteCDNOriginUseCase);

  public async handle(params: {
    input: {
      eventId: string;
      cdnDistributionId: string;
    };
  }): Promise<void> {
    await this.useCase.deleteCDNOrigin({
      eventId: params.input.eventId,
      cdnDistributionId: params.input.cdnDistributionId,
    });
  }
}
