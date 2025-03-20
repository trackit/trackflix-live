import { tokencreateCDNDistributionUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';

export class createCloudFrontDistributionAdapter {
  private readonly useCase = inject(tokencreateCDNDistributionUseCase);

  public async handle(params: {
    input: {
      eventId: string;
      packageDomainName: string;
    };
  }): Promise<{ eventId: string; cdnDistributionId: string }> {
    const CDNDistribution = await this.useCase.createCDNDistribution({
      eventId: params.input.eventId,
      packageDomainName: params.input.packageDomainName,
    });

    return {
      eventId: params.input.eventId,
      cdnDistributionId: CDNDistribution.cdnDistributionId,
    };
  }
}
