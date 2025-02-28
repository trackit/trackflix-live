import { StartTransmissionAdapter } from './startTransmission.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new StartTransmissionAdapter();

export const main = async (event: { eventId: string }): Promise<void> => {
  await adapter.handle(event);
};
