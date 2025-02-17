import { StopTransmissionUseCaseImpl } from './stopTransmission';
import { TransmissionsManagerFake } from '../../infrastructure/TransmissionsManagerFake';

describe('Stop transmission use case', () => {
  it('should stop transmission', async () => {
    const { useCase, transmissionsManager } = setup();
    const eventId = 'ce095ddc-a38b-45bd-ad2a-d227653c4957';

    await useCase.stopTransmission(eventId);

    expect(transmissionsManager.stoppedTransmissions).toEqual([eventId]);
  });
});

const setup = () => {
  const transmissionsManager = new TransmissionsManagerFake();
  return {
    transmissionsManager,
    useCase: new StopTransmissionUseCaseImpl({
      transmissionsManager,
    }),
  };
};
