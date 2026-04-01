import { tokenCreateLiveChannelUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';
import { EventEndpoint } from '@trackflix-live/types';

export class CreateMediaLiveChannelAdapter {
  private readonly useCase = inject(tokenCreateLiveChannelUseCase);

  public async handle({
    input: {
      eventId,
      packageChannelId,
      verticalPackageChannelId,
      packageDomainName,
      verticalPackageDomainName,
      endpoints,
    },
    taskToken,
  }: {
    input: {
      eventId: string;
      packageChannelId: string;
      verticalPackageChannelId?: string;
      packageDomainName: string;
      verticalPackageDomainName?: string;
      endpoints: EventEndpoint[];
    };
    taskToken: string;
  }): Promise<{
    eventId: string;
    packageChannelId: string;
    verticalPackageChannelId?: string;
    packageDomainName: string;
    verticalPackageDomainName?: string;
    liveChannelId: string;
    liveChannelArn: string;
    endpoints: EventEndpoint[];
  }> {
    const liveChannel = await this.useCase.createLiveChannel({
      eventId,
      packageChannelId,
      verticalPackageChannelId,
      packageDomainName,
      verticalPackageDomainName,
      taskToken,
      endpoints,
    });

    return {
      eventId,
      packageChannelId,
      verticalPackageChannelId,
      packageDomainName,
      verticalPackageDomainName,
      liveChannelId: liveChannel.channelId,
      liveChannelArn: liveChannel.channelArn,
      endpoints,
    };
  }
}
