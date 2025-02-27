import { CreatePackageChannelUseCaseImpl } from '@trackflix-live/api-events';
import { CreateMediaPackageChannelAdapter } from './createMediaPackageChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const useCase = new CreatePackageChannelUseCaseImpl();

const adapter = new CreateMediaPackageChannelAdapter({
  useCase,
});

export const main = async (event: {
  eventId: string;
}): Promise<{ eventId: string; packageChannelId: string }> =>
  adapter.handle(event);
