import { StopTransmissionAdapter } from './stopTransmission.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new StopTransmissionAdapter();

export const main = async (event: { eventId: string }): Promise<void> => {
  await adapter.handle(event);
};
