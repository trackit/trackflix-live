import { CreateCloudFrontOriginAdapter } from './createCloudFrontOrigin.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { EventEndpoint } from '@trackflix-live/types';

registerProductionInfrastructure();

const adapter = new CreateCloudFrontOriginAdapter();

export const main = async (params: {
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
}> => {
  await adapter.handle(params);
  return {
    eventId: params.eventId,
    liveChannelArn: params.liveChannelArn,
    liveChannelId: params.liveChannelId,
    packageChannelId: params.packageChannelId,
  };
};
