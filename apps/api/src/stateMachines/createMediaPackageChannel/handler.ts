import { CreateMediaPackageChannelAdapter } from './createMediaPackageChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { registerQaInfrastructure } from '../../infrastructure/registerQaInfrastructure';

const infrastructure =
  process.env.QA_MODE !== 'true'
    ? registerProductionInfrastructure
    : registerQaInfrastructure;
infrastructure();

const adapter = new CreateMediaPackageChannelAdapter();

export const main = async (event: {
  eventId: string;
}): Promise<{ eventId: string; packageChannelId: string }> =>
  adapter.handle(event);
