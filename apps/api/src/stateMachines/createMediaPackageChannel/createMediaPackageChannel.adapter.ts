import { tokenCreatePackageChannelUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';
import { EventEndpoint } from '@trackflix-live/types';

export class CreateMediaPackageChannelAdapter {
  private readonly useCase = inject(tokenCreatePackageChannelUseCase);

  public async handle({ eventId }: { eventId: string }): Promise<{
    eventId: string;
    packageChannelId: string;
    verticalPackageChannelId: string;
    packageDomainName: string;
    verticalPackageDomainName: string;
    endpoints: EventEndpoint[];
  }> {
    const {
      packageChannelId,
      verticalPackageChannelId,
      packageDomainName,
      verticalPackageDomainName,
      endpoints,
    } = await this.useCase.createPackageChannel(eventId);

    return {
      eventId,
      packageChannelId,
      verticalPackageChannelId,
      packageDomainName,
      verticalPackageDomainName,
      endpoints,
    };
  }
}
