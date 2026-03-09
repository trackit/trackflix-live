import { CreateMediaLiveChannelAdapter } from './createMediaLiveChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { EventEndpoint } from '@trackflix-live/types';

registerProductionInfrastructure();

const adapter = new CreateMediaLiveChannelAdapter();

export const main = async (params: {
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
}> => adapter.handle(params);
