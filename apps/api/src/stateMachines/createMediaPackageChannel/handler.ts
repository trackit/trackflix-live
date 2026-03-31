import { CreateMediaPackageChannelAdapter } from './createMediaPackageChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { EventEndpoint } from '@trackflix-live/types';

registerProductionInfrastructure();

const adapter = new CreateMediaPackageChannelAdapter();

export const main = async (event: {
  eventId: string;
}): Promise<{
  eventId: string;
  packageChannelId: string;
  verticalPackageChannelId?: string;
  packageDomainName: string;
  verticalPackageDomainName?: string;
  endpoints: EventEndpoint[];
}> => adapter.handle(event);
