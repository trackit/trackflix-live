import { StartMediaLiveChannelAdapter } from './startMediaLiveChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { registerQaInfrastructure } from '../../infrastructure/registerQaInfrastructure';

const infrastructure =
  process.env.QA_MODE !== 'true'
    ? registerProductionInfrastructure
    : registerQaInfrastructure;
infrastructure();

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
