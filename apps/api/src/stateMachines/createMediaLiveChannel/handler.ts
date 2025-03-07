import { CreateMediaLiveChannelAdapter } from './createMediaLiveChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new CreateMediaLiveChannelAdapter();

export const main = async (params: {
  input: {
    eventId: string;
    packageChannelId: string;
  };
  taskToken: string;
}): Promise<{
  eventId: string;
  packageChannelId: string;
  liveChannelId: string;
  liveChannelArn: string;
}> => adapter.handle(params);
