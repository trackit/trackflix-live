import { DeleteMediaLiveChannelAdapter } from './deleteMediaLiveChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new DeleteMediaLiveChannelAdapter();

export const main = async (params: {
  input: {
    eventId: string;
  };
  taskToken: string;
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
