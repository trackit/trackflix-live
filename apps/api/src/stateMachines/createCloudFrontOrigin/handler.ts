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
  const cdnDistributionId = process.env.DISTRIBUTION_ID;
  if (!cdnDistributionId) {
    throw new Error('DISTRIBUTION_ID environment variable is not set');
  }
  await adapter.handle({ ...params, cdnDistributionId });
  return {
    eventId: params.eventId,
    liveChannelArn: params.liveChannelArn,
    liveChannelId: params.liveChannelId,
    packageChannelId: params.packageChannelId,
  };
};
