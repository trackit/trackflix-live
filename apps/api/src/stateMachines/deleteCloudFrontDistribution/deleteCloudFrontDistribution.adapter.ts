import { tokenDeleteCDNDistributionUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';

export class DeleteCloudFrontDistributionAdapter {
  private readonly useCase = inject(tokenDeleteCDNDistributionUseCase);

  public async handle(params: {
    input: {
      cdnDistributionId: string;
    };
  }): Promise<void> {
    await this.useCase.deleteCDNDistribution({
      cdnDistributionId: params.input.cdnDistributionId,
    });
  }
}
