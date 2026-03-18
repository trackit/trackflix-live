import { CreateMediaLiveChannelAdapter } from './createMediaLiveChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { EventEndpoint } from '@trackflix-live/types';

registerProductionInfrastructure();

const adapter = new CreateMediaLiveChannelAdapter();

export const main = async (params: {
  input: {
    eventId: string;
    mainChannelId: string;
    verticalChannelId: string;
    endpoints: EventEndpoint[];
  };
  taskToken: string;
}): Promise<{
  eventId: string;
  mainChannelId: string;
  verticalChannelId: string;
  liveChannelId: string;
  liveChannelArn: string;
}> => adapter.handle(params);
