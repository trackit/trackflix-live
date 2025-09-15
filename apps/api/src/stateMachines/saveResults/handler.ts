import { SaveResultsAdapter } from './saveResults.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { registerQaInfrastructure } from '../../infrastructure/registerQaInfrastructure';

const infrastructure =
  process.env.QA_MODE !== 'true'
    ? registerProductionInfrastructure
    : registerQaInfrastructure;
infrastructure();

const adapter = new SaveResultsAdapter();

export const main = async (event: {
  eventId: string;
}): Promise<{ onAirStartTime: string; eventId: string }> =>
  adapter.handle(event);
