import { StartTransmissionUseCaseImpl } from './startTransmission';
import { TransmissionsManagerFake } from '../../infrastructure/TransmissionsManagerFake';

describe('Start transmission use case', () => {
  it('should start transmission', async () => {
    const { useCase, transmissionsManager } = setup();
    const eventId = 'ce095ddc-a38b-45bd-ad2a-d227653c4957';

    await useCase.startTransmission(eventId);

    expect(transmissionsManager.startedTransmissions).toEqual([eventId]);
  });
});

const setup = () => {
  const transmissionsManager = new TransmissionsManagerFake();
  return {
    transmissionsManager,
    useCase: new StartTransmissionUseCaseImpl({
      transmissionsManager,
    }),
  };
};
