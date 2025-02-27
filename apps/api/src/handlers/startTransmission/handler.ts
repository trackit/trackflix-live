import { StartTransmissionUseCaseImpl } from '@trackflix-live/api-events';
import { StartTransmissionAdapter } from './startTransmission.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const useCase = new StartTransmissionUseCaseImpl();

const adapter = new StartTransmissionAdapter({
  useCase,
});

export const main = async (event: { eventId: string }): Promise<void> => {
  await adapter.handle(event);
};
