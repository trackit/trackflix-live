import {
  StartTransmissionUseCase,
  tokenStartTransmissionUseCase,
} from '@trackflix-live/api-events';
import { StartTransmissionAdapter } from './startTransmission.adapter';
import { register, reset } from 'di';

describe('Start Transmission adapter', () => {
  it('should call use case', async () => {
    const { adapter, useCase } = setup();
    const eventId = '8d656095-3cd7-4069-aff9-b98ab7ebec30';

    await adapter.handle({
      eventId,
    });

    expect(useCase.startTransmission).toHaveBeenCalledWith(eventId);
  });
});

const setup = () => {
  reset();

  const useCase: StartTransmissionUseCase = {
    startTransmission: jest.fn(),
  };
  register(tokenStartTransmissionUseCase, { useValue: useCase });

  return {
    adapter: new StartTransmissionAdapter(),
    useCase,
  };
};
