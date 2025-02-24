import { StopTransmissionUseCaseImpl } from '@trackflix-live/api-events';
import { StopTransmissionAdapter } from './stopTransmission.adapter';
import { TransmissionsManagerSfn } from '../../infrastructure/TransmissionsManagerSfn';
import { SFNClient } from '@aws-sdk/client-sfn';

const transmissionsManager = new TransmissionsManagerSfn({
  client: new SFNClient(),
  startTransmissionStateMachineArn: process.env['START_TX_STATE_MACHINE']!,
  stopTransmissionStateMachineArn: process.env['STOP_TX_STATE_MACHINE']!,
});
const useCase = new StopTransmissionUseCaseImpl({
  transmissionsManager,
});
const adapter = new StopTransmissionAdapter({
  useCase,
});

export const main = async (event: { eventId: string }): Promise<void> => {
  await adapter.handle(event);
};
