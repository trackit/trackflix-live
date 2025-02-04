import { StartTransmissionUseCase } from '@trackflix-live/api-events';
import { StartTransmissionAdapter } from './startTransmission.adapter';

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
  const useCase: StartTransmissionUseCase = {
    startTransmission: jest.fn(),
  };
  return {
    adapter: new StartTransmissionAdapter({
      useCase,
    }),
    useCase,
  };
};
