import { StopTransmissionUseCaseImpl } from '@trackflix-live/api-events';
import { StopTransmissionAdapter } from './stopTransmission.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const useCase = new StopTransmissionUseCaseImpl();

const adapter = new StopTransmissionAdapter({
  useCase,
});

export const main = async (event: { eventId: string }): Promise<void> => {
  await adapter.handle(event);
};
