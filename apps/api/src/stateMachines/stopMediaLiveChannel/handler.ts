import { StopMediaLiveChannelAdapter } from './stopMediaLiveChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new StopMediaLiveChannelAdapter();

export const main = async (params: {
  input: {
    eventId: string;
  };
  taskToken: string;
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
