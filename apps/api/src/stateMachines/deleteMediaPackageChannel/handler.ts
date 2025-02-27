import { DeleteMediaPackageChannelAdapter } from './deleteMediaPackageChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new DeleteMediaPackageChannelAdapter();

export const main = async (params: {
  eventId: string;
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
