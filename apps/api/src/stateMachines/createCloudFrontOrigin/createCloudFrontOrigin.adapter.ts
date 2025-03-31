import { tokenCreateCDNOriginUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';

export class CreateCloudFrontOriginAdapter {
  private readonly useCase = inject(tokenCreateCDNOriginUseCase);

  public async handle(params: {
    eventId: string;
    liveChannelArn: string;
    liveChannelId: string;
    packageChannelId: string;
    packageDomainName: string;
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
    });
    return {
      eventId: params.eventId,
      liveChannelArn: params.liveChannelArn,
      liveChannelId: params.liveChannelId,
      packageChannelId: params.packageChannelId,
    };
  }
}
