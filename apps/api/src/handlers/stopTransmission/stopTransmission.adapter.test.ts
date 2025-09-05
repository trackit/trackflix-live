import {
  StopTransmissionUseCase,
  tokenStopTransmissionUseCase,
} from '@trackflix-live/api-events';
import { StopTransmissionAdapter } from './stopTransmission.adapter';
import { register, reset } from '@trackflix-live/di';
import * as allure from 'allure-js-commons';

describe('Stop Transmission adapter', () => {
  it('should call use case', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to create a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { adapter, useCase } = setup();
    const eventId = '8d656095-3cd7-4069-aff9-b98ab7ebec30';

    await adapter.handle({
      eventId,
    });

    expect(useCase.stopTransmission).toHaveBeenCalledWith(eventId);
  });
});

const setup = () => {
  reset();

  const useCase: StopTransmissionUseCase = {
    stopTransmission: jest.fn(),
  };
  register(tokenStopTransmissionUseCase, { useValue: useCase });

  return {
    adapter: new StopTransmissionAdapter(),
    useCase,
  };
};
