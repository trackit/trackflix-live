import { CreateMediaPackageChannelAdapter } from './createMediaPackageChannel.adapter';
import { register, reset } from '@trackflix-live/di';
import { tokenCreatePackageChannelUseCase } from '@trackflix-live/api-events';
import { EventEndpoint } from '@trackflix-live/types';

describe('Create MediaPackage channel', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9c6c0f2c-c9bf-45ce-8d8b-211929b85653';
    const result = {
      packageChannelId: 'main-123',
      verticalPackageChannelId: 'vert-123',
      packageDomainName: 'domain.com',
      verticalPackageDomainName: 'vdomain.com',
      endpoints: [] as EventEndpoint[],
    };

    useCase.createPackageChannel.mockImplementation(() => result);

    const output = await adapter.handle({
      eventId,
    });

    expect(output).toEqual({
      eventId,
      ...result,
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
