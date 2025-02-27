import { DeleteMediaLiveChannelAdapter } from './deleteMediaLiveChannel.adapter';
import { DeleteLiveChannelUseCaseImpl } from '@trackflix-live/api-events';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const useCase = new DeleteLiveChannelUseCaseImpl();

const adapter = new DeleteMediaLiveChannelAdapter({
  useCase,
});

export const main = async (params: {
  input: {
    eventId: string;
  };
  taskToken: string;
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
