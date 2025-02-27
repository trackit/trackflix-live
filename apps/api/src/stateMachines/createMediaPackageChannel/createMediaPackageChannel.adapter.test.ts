import { CreateMediaPackageChannelAdapter } from './createMediaPackageChannel.adapter';
import { register, reset } from 'di';
import { tokenCreatePackageChannelUseCase } from '@trackflix-live/api-events';

describe('Create MediaPackage channel', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9c6c0f2c-c9bf-45ce-8d8b-211929b85653';
    const packageChannelId = '123456';

    useCase.createPackageChannel.mockImplementation(() => packageChannelId);

    const result = await adapter.handle({
      eventId,
    });

    expect(result).toEqual({
      eventId,
      packageChannelId,
    });
    expect(useCase.createPackageChannel).toHaveBeenCalledWith(eventId);
  });
});

const setup = () => {
  reset();

  const useCase = {
    createPackageChannel: jest.fn(),
  };
  register(tokenCreatePackageChannelUseCase, { useValue: useCase });

  const adapter = new CreateMediaPackageChannelAdapter();

  return {
    useCase,
    adapter,
  };
};
