import { tokenCreateCDNOriginUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';
import { EventEndpoint } from '@trackflix-live/types';

export class CreateCloudFrontOriginAdapter {
  private readonly useCase = inject(tokenCreateCDNOriginUseCase);

  public async handle(params: {
    eventId: string;
    packageDomainName: string;
    endpoints: EventEndpoint[];
    cdnDistributionId: string;
  }): Promise<{
    eventId: string;
  }> {
    await this.useCase.createCDNOrigin({
      eventId: params.eventId,
      packageDomainName: params.packageDomainName,
      endpoints: params.endpoints,
      cdnDistributionId: params.cdnDistributionId,
    });
    return {
      eventId: params.eventId,
    };
  }
}
