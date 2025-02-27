import { StartTransmissionUseCaseImpl } from './startTransmission';
import {
  registerTestInfrastructure,
  tokenTransmissionsManagerFake,
} from '../../infrastructure';
import { inject, reset } from '@trackflix-live/di';

describe('Start transmission use case', () => {
  it('should start transmission', async () => {
    const { useCase, transmissionsManager } = setup();
    const eventId = 'ce095ddc-a38b-45bd-ad2a-d227653c4957';

    await useCase.startTransmission(eventId);

    expect(transmissionsManager.startedTransmissions).toEqual([eventId]);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const transmissionsManager = inject(tokenTransmissionsManagerFake);

  const useCase = new StartTransmissionUseCaseImpl();

  return {
    transmissionsManager,
    useCase,
  };
};
