import { SetErrorStatusAdapter } from './setErrorStatus.adapter';
import { register, reset } from '@trackflix-live/di';
import { tokenSetErrorStatusUseCase } from '@trackflix-live/api-events';

describe('Set error status adapter', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9ce722b8-121f-4f9a-b2ee-3f94760abfd2';

    await adapter.handle({
      eventId,
    });

    expect(useCase.setErrorStatus).toHaveBeenCalledWith(eventId);
  });
});

const setup = () => {
  reset();

  const useCase = {
    setErrorStatus: jest.fn(),
  };
  register(tokenSetErrorStatusUseCase, { useValue: useCase });

  const adapter = new SetErrorStatusAdapter();

  return {
    useCase,
    adapter,
  };
};
