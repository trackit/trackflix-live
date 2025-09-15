import { DeleteMediaLiveChannelAdapter } from './deleteMediaLiveChannel.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { registerQaInfrastructure } from '../../infrastructure/registerQaInfrastructure';

const infrastructure =
  process.env.QA_MODE !== 'true'
    ? registerProductionInfrastructure
    : registerQaInfrastructure;
infrastructure();

const adapter = new DeleteMediaLiveChannelAdapter();

export const main = async (params: {
  input: {
    eventId: string;
  };
  taskToken: string;
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
