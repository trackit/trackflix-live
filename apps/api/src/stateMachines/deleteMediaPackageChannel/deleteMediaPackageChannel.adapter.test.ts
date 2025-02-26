import { DeleteMediaPackageChannelAdapter } from './deleteMediaPackageChannel.adapter';

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
  const useCase = {
    deletePackageChannel: jest.fn(),
  };
  const adapter = new DeleteMediaPackageChannelAdapter({
    useCase,
  });
  return {
    useCase,
    adapter,
  };
};
