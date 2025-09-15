import { StopTransmissionAdapter } from './stopTransmission.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { registerQaInfrastructure } from '../../infrastructure/registerQaInfrastructure';

const infrastructure =
  process.env.QA_MODE !== 'true'
    ? registerProductionInfrastructure
    : registerQaInfrastructure;
infrastructure();

const adapter = new StopTransmissionAdapter();

export const main = async (event: { eventId: string }): Promise<void> => {
  await adapter.handle(event);
};
