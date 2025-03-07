import { StartMediaLiveChannelAdapter } from './startMediaLiveChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new StartMediaLiveChannelAdapter();

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
