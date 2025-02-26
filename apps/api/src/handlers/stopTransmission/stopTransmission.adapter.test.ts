import { StopTransmissionUseCase } from '@trackflix-live/api-events';
import { StopTransmissionAdapter } from './stopTransmission.adapter';

describe('Stop Transmission adapter', () => {
  it('should call use case', async () => {
    const { adapter, useCase } = setup();
    const eventId = '8d656095-3cd7-4069-aff9-b98ab7ebec30';

    await adapter.handle({
      eventId,
    });

    expect(useCase.stopTransmission).toHaveBeenCalledWith(eventId);
  });
});

const setup = () => {
  const useCase: StopTransmissionUseCase = {
    stopTransmission: jest.fn(),
  };
  return {
    adapter: new StopTransmissionAdapter({
      useCase,
    }),
    useCase,
  };
};
