import { DeleteMediaLiveInputAdapter } from './deleteMediaLiveInput.adapter';
import { DeleteLiveInputUseCaseImpl } from '@trackflix-live/api-events';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const useCase = new DeleteLiveInputUseCaseImpl();

const adapter = new DeleteMediaLiveInputAdapter({
  useCase,
});

export const main = async (params: {
  eventId: string;
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
