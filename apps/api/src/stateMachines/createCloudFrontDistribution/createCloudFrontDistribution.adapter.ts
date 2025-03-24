import { tokenCreateCDNDistributionUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';

export class CreateCloudFrontDistributionAdapter {
  private readonly useCase = inject(tokenCreateCDNDistributionUseCase);

  public async handle(): Promise<{ cdnDistributionId: string }> {
    const CDNDistribution = await this.useCase.createCDNDistribution();

    return {
      cdnDistributionId: CDNDistribution.cdnDistributionId,
    };
  }
}
