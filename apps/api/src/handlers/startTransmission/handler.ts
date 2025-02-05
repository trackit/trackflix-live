import { StartTransmissionUseCaseImpl } from '@trackflix-live/api-events';
import { StartTransmissionAdapter } from './startTransmission.adapter';
import { TransmissionsManagerSfn } from '../../infrastructure/TransmissionsManagerSfn';
import { SFNClient } from '@aws-sdk/client-sfn';

const transmissionsManager = new TransmissionsManagerSfn({
  client: new SFNClient(),
  stateMachineArn: process.env['START_TX_STATE_MACHINE']!,
});
const useCase = new StartTransmissionUseCaseImpl({
  transmissionsManager,
});
const adapter = new StartTransmissionAdapter({
  useCase,
});

export const main = async (event: { eventId: string }): Promise<void> => {
  await adapter.handle(event);
};
