import { DeleteMediaLiveInputAdapter } from './deleteMediaLiveInput.adapter';
import { register, reset } from 'di';
import { tokenDeleteLiveInputUseCase } from '@trackflix-live/api-events';

describe('Delete MediaLive input adapter', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9ce722b8-121f-4f9a-b2ee-3f94760abfd2';

    const result = await adapter.handle({
      eventId,
    });

    expect(result).toEqual({
      eventId,
    });
    expect(useCase.deleteLiveInput).toHaveBeenCalledWith({
      eventId,
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    deleteLiveInput: jest.fn(),
  };
  register(tokenDeleteLiveInputUseCase, { useValue: useCase });

  const adapter = new DeleteMediaLiveInputAdapter();

  return {
    useCase,
    adapter,
  };
};
