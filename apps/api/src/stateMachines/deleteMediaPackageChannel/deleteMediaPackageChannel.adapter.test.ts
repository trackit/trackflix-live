import { DeleteMediaPackageChannelAdapter } from './deleteMediaPackageChannel.adapter';
import { register, reset } from '@trackflix-live/di';
import { tokenDeletePackageChannelUseCase } from '@trackflix-live/api-events';

describe('Delete MediaPackage channel adapter', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9ce722b8-121f-4f9a-b2ee-3f94760abfd2';

    const result = await adapter.handle({
      eventId,
    });

    expect(result).toEqual({
      eventId,
    });
    expect(useCase.deletePackageChannel).toHaveBeenCalledWith({
      eventId,
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    deletePackageChannel: jest.fn(),
  };
  register(tokenDeletePackageChannelUseCase, { useValue: useCase });

  const adapter = new DeleteMediaPackageChannelAdapter();

  return {
    useCase,
    adapter,
  };
};
