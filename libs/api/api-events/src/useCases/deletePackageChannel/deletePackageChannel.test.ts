import { PackageChannelsManagerFake } from '../../infrastructure';
import { DeletePackageChannelUseCaseImpl } from './deletePackageChannel';

describe('Delete live channel use case', () => {
  it('should delete live channel', async () => {
    const { packageChannelsManager, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';

    await useCase.deletePackageChannel({
      eventId,
    });

    expect(packageChannelsManager.deletedChannels).toEqual([eventId]);
  });
});

const setup = () => {
  const packageChannelsManager = new PackageChannelsManagerFake();

  const useCase = new DeletePackageChannelUseCaseImpl({
    packageChannelsManager,
  });

  return {
    packageChannelsManager,
    useCase,
  };
};
