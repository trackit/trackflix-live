import { SetErrorStatusAdapter } from './setErrorStatus.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { registerQaInfrastructure } from '../../infrastructure/registerQaInfrastructure';

const infrastructure =
  process.env.QA_MODE !== 'true'
    ? registerProductionInfrastructure
    : registerQaInfrastructure;
infrastructure();

const adapter = new SetErrorStatusAdapter();

export const main = async (event: { eventId: string }): Promise<void> =>
  adapter.handle(event);
