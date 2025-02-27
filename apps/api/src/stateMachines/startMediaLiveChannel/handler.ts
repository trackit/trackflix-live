import { StartMediaLiveChannelAdapter } from './startMediaLiveChannel.adapter';
import { StartLiveChannelUseCaseImpl } from '@trackflix-live/api-events';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const useCase = new StartLiveChannelUseCaseImpl();

const adapter = new StartMediaLiveChannelAdapter({
  useCase,
});

export const main = async (params: {
  input: {
    eventId: string;
    packageChannelId: string;
    liveChannelId: string;
    liveChannelArn: string;
  };
  taskToken: string;
}): Promise<{
  eventId: string;
  packageChannelId: string;
  liveChannelId: string;
  liveChannelArn: string;
}> => adapter.handle(params);
