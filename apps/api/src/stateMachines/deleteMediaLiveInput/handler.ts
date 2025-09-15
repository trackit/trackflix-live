import { DeleteMediaLiveInputAdapter } from './deleteMediaLiveInput.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { registerQaInfrastructure } from '../../infrastructure/registerQaInfrastructure';

const infrastructure =
  process.env.QA_MODE !== 'true'
    ? registerProductionInfrastructure
    : registerQaInfrastructure;
infrastructure();

const adapter = new DeleteMediaLiveInputAdapter();

export const main = async (params: {
  eventId: string;
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
