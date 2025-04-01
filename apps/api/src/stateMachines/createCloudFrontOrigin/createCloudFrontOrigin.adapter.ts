import { tokenCreateCDNOriginUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';
import { EventEndpoint } from '@trackflix-live/types';

export class CreateCloudFrontOriginAdapter {
  private readonly useCase = inject(tokenCreateCDNOriginUseCase);

  public async handle(params: {
    eventId: string;
    liveChannelArn: string;
    liveChannelId: string;
    packageChannelId: string;
    packageDomainName: string;
    endpoints: EventEndpoint[];
  }): Promise<{
    eventId: string;
    liveChannelArn: string;
    liveChannelId: string;
    packageChannelId: string;
  }> {
    console.log('params CreateCloudFrontOrigin', params);
    await this.useCase.createCDNOrigin({
      eventId: params.eventId,
      liveChannelArn: params.liveChannelArn,
      liveChannelId: params.liveChannelId,
      packageChannelId: params.packageChannelId,
      packageDomainName: params.packageDomainName,
      endpoints: params.endpoints,
    });
    return {
      eventId: params.eventId,
      liveChannelArn: params.liveChannelArn,
      liveChannelId: params.liveChannelId,
      packageChannelId: params.packageChannelId,
    };
  }
}
