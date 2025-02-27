import { SaveResultsAdapter } from './saveResults.adapter';
import { SaveResultsUseCaseImpl } from '@trackflix-live/api-events';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const useCase = new SaveResultsUseCaseImpl();

const adapter = new SaveResultsAdapter({
  useCase,
});

export const main = async (event: { eventId: string }): Promise<void> =>
  adapter.handle(event);
