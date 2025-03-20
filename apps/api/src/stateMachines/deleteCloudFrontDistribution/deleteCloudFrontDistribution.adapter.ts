import { tokenDeleteCDNDistributionUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';

export class DeleteCloudFrontDistributionAdapter {
  private readonly useCase = inject(tokenDeleteCDNDistributionUseCase);

  public async handle(params: {
    input: {
      eventId: string;
      cdnDistributionId: string;
    };
  }): Promise<{
    eventId: string;
  }> {
    await this.useCase.deleteCDNDistribution({
      eventId: params.input.eventId,
      cdnDistributionId: params.input.cdnDistributionId,
    });

    return {
      eventId: params.input.eventId,
    };
  }
}
