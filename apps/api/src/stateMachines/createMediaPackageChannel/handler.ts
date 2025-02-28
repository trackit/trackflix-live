import { CreateMediaPackageChannelAdapter } from './createMediaPackageChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new CreateMediaPackageChannelAdapter();

export const main = async (event: {
  eventId: string;
}): Promise<{ eventId: string; packageChannelId: string }> =>
  adapter.handle(event);
