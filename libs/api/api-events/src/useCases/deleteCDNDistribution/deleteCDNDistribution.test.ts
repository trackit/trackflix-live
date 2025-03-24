import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenCDNDistributionsManagerFake,
} from '../../infrastructure';
import { DeleteCDNDistributionUseCaseImpl } from './deleteCDNDistribution';
import {
  EventMother,
} from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';

describe('Delete CDN distribution use case', () => {
  it('should delete CDN distribution', async () => {
    const { CDNDistributionsManager, eventsRepository, useCase } = setup();
    const cdnDistributionId = 'E2QWRUHAPVYC32';
    await eventsRepository.createEvent(
      EventMother.basic()
        .withCDNDistributionId(cdnDistributionId)
        .build()
    );

    await useCase.deleteCDNDistribution({
      cdnDistributionId,
    });

    expect(CDNDistributionsManager.deletedDistributions).toEqual([
      cdnDistributionId,
    ]);
  });

  it('should append to event logs', async () => {
    const { eventsRepository, useCase } = setup();
    const cdnDistributionId = 'E2QWRUHAPVYC32';
    await eventsRepository.createEvent(
      EventMother.basic()
        .withCDNDistributionId(cdnDistributionId)
        .build()
    );

    await useCase.deleteCDNDistribution({
      cdnDistributionId,
    });
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const CDNDistributionsManager = inject(tokenCDNDistributionsManagerFake);
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);

  const useCase = new DeleteCDNDistributionUseCaseImpl();

  return {
    CDNDistributionsManager,
    eventsRepository,
    eventUpdateSender,
    useCase,
  };
};
