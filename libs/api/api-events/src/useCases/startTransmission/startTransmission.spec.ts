import { StartTransmissionUseCaseImpl } from './startTransmission';
import {
  registerTestInfrastructure,
  tokenTransmissionsManagerFake,
} from '../../infrastructure';
import { inject, reset } from '@trackflix-live/di';
import * as allure from 'allure-js-commons';

describe('Start transmission use case', () => {
  it('should start transmission', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to create a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

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
