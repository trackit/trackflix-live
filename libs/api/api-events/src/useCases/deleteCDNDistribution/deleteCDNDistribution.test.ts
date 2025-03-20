import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenCDNDistributionsManagerFake,
} from '../../infrastructure';
import { DeleteCDNDistributionUseCaseImpl } from './deleteCDNDistribution';
import {
  EventMother,
  EventUpdateAction,
  LogType,
} from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';

describe('Delete CDN distribution use case', () => {
  it('should delete CDN distribution', async () => {
    const { CDNDistributionsManager, eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const cdnDistributionId = 'E2QWRUHAPVYC32';
    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .withCDNDistributionId(cdnDistributionId)
        .build()
    );

    await useCase.deleteCDNDistribution({
      eventId,
      cdnDistributionId,
    });

    expect(CDNDistributionsManager.deletedDistributions).toEqual([
      cdnDistributionId,
    ]);
  });

  it('should append to event logs', async () => {
    const { eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const cdnDistributionId = 'E2QWRUHAPVYC32';
    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .withCDNDistributionId(cdnDistributionId)
        .build()
    );

    await useCase.deleteCDNDistribution({
      eventId,
      cdnDistributionId,
    });

    expect(eventsRepository.events).toMatchObject([
      {
        id: eventId,
        logs: [
          {
            timestamp: expect.any(Number),
            type: LogType.CDN_DISTRIBUTION_DESTROYED,
          },
        ],
      },
    ]);
  });

  it('should emit update', async () => {
    const { eventsRepository, eventUpdateSender, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const cdnDistributionId = 'E2QWRUHAPVYC32';
    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .withCDNDistributionId(cdnDistributionId)
        .build()
    );

    await useCase.deleteCDNDistribution({
      eventId,
      cdnDistributionId,
    });

    expect(eventUpdateSender.eventUpdates).toEqual([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: eventsRepository.events[0],
      },
    ]);
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
