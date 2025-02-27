import { DeleteMediaPackageChannelAdapter } from './deleteMediaPackageChannel.adapter';
import { DeletePackageChannelUseCaseImpl } from '@trackflix-live/api-events';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const useCase = new DeletePackageChannelUseCaseImpl();

const adapter = new DeleteMediaPackageChannelAdapter({
  useCase,
});

export const main = async (params: {
  eventId: string;
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
