import { SaveResultsAdapter } from './saveResults.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new SaveResultsAdapter();

export const main = async (event: {
  eventId: string;
}): Promise<{ onAirStartTime: string; eventId: string }> =>
  adapter.handle(event);
