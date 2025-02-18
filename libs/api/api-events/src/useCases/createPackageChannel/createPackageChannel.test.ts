import { CreatePackageChannelUseCaseImpl } from './createPackageChannel';
import { PackageChannelsManagerFake } from '../../infrastructure/PackageChannelsManagerFake';

describe('Create Package channel use case', () => {
  it('should create channel', async () => {
    const { useCase, packageChannelsManager } = setup();
    const eventId = 'db9fa693-360d-40a7-85b7-2f16907045fa';
    const packageChannelId = '8123456';

    packageChannelsManager.setPackageChannelId(packageChannelId);

    const response = await useCase.createPackageChannel(eventId);

    expect(response).toEqual(packageChannelId);
    expect(packageChannelsManager.createdChannels).toEqual([eventId]);
  });
});

const setup = () => {
  const packageChannelsManager = new PackageChannelsManagerFake();
  const useCase = new CreatePackageChannelUseCaseImpl({
    packageChannelsManager,
  });

  return {
    useCase,
    packageChannelsManager,
  };
};
