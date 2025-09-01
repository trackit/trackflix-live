import { StopTransmissionUseCaseImpl } from './stopTransmission';
import {
  tokenTransmissionsManagerFake,
  registerTestInfrastructure,
} from '../../infrastructure';
import { inject, reset } from '@trackflix-live/di';
import * as allure from 'allure-js-commons';

describe('Stop transmission use case', () => {
  it('should stop transmission', async () => {
    await allure.feature('Live resources management');
    await allure.story('Stop transmission');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { useCase, transmissionsManager } = setup();
    const eventId = 'ce095ddc-a38b-45bd-ad2a-d227653c4957';

    await useCase.stopTransmission(eventId);

    expect(transmissionsManager.stoppedTransmissions).toEqual([eventId]);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const transmissionsManager = inject(tokenTransmissionsManagerFake);

  const useCase = new StopTransmissionUseCaseImpl();

  return {
    transmissionsManager,
    useCase,
  };
};
