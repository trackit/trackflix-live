import { DeleteMediaLiveInputAdapter } from './deleteMediaLiveInput.adapter';

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
  const useCase = {
    deleteLiveInput: jest.fn(),
  };
  const adapter = new DeleteMediaLiveInputAdapter({
    useCase,
  });
  return {
    useCase,
    adapter,
  };
};
