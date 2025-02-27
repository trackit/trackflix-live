import { StopMediaLiveChannelAdapter } from './stopMediaLiveChannel.adapter';
import { StopLiveChannelUseCaseImpl } from '@trackflix-live/api-events';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const useCase = new StopLiveChannelUseCaseImpl();

const adapter = new StopMediaLiveChannelAdapter({
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
