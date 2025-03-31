import { CreateCloudFrontOriginAdapter } from './createCloudFrontOrigin.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new CreateCloudFrontOriginAdapter();

export const main = async (params: {
  eventId: string;
  liveChannelArn: string;
  liveChannelId: string;
  packageChannelId: string;
  packageDomainName: string;
}): Promise<{
  eventId: string;
}> => {
  return adapter.handle(params);
};
