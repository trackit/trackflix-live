import { tokenCreateCDNOriginUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';

export class CreateCloudFrontOriginAdapter {
  private readonly useCase = inject(tokenCreateCDNOriginUseCase);

  public async handle(params: {
    input: {
      eventId: string;
      cdnDistributionId: string;
      packageDomainName: string;
    };
  }): Promise<void> {
    await this.useCase.createCDNOrigin({
      eventId: params.input.eventId,
      cdnDistributionId: params.input.cdnDistributionId,
      packageDomainName: params.input.packageDomainName,
    });
  }
}
