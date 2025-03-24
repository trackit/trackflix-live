import { CreateCDNOriginUseCaseImpl } from './createCDNOrigin';
import {
  registerTestInfrastructure,
  tokenCDNDistributionsManagerFake,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenTaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { EventMother, EventUpdateAction } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils/errors';

describe('Create CDN origin use case', () => {
  it('should create CDN origin', async () => {
    const { useCase, eventsRepository, CDNDistributionsManager } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const cdnDistributionId = 'E2QWRUHAPVYC32';
    const packageDomainName = 'trackit.io';

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .build()
    );

    await useCase.createCDNOrigin({
      eventId,
      cdnDistributionId,
      packageDomainName
    });

    expect(CDNDistributionsManager.createdOrigins).toEqual([
      {
        eventId,
        cdnDistributionId,
        packageDomainName
      },
    ]);
  });

  it('should store logs after creating the CDN origin', async () => {
    const { useCase, eventsRepository } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const cdnDistributionId = 'E2QWRUHAPVYC32';
    const packageDomainName = 'trackit.io';

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .build()
    );

    await useCase.createCDNOrigin({
      eventId,
      cdnDistributionId,
      packageDomainName
    });

    expect(eventsRepository.events[0].logs).toEqual([
      {
        timestamp: expect.any(Number),
        type: 'CDN_ORIGIN_CREATED',
      },
    ]);
  });

  it('should emit logs after creating the CDN origin', async () => {
    const {
      useCase,
      eventsRepository,
      eventUpdateSender,
    } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const cdnDistributionId = 'E2QWRUHAPVYC32';
    const packageDomainName = 'trackit.io';

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .build()
    );

    await useCase.createCDNOrigin({
      eventId,
      cdnDistributionId,
      packageDomainName
    });

    expect(eventUpdateSender.eventUpdates).toMatchObject([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: {
          id: eventId,
          logs: [
            {
              timestamp: expect.any(Number),
              type: 'CDN_ORIGIN_CREATED',
            },
          ],
        },
      },
    ]);
  });

  it('should throw if event does not exist', async () => {
    const { useCase } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const cdnDistributionId = 'E2QWRUHAPVYC32';
    const packageDomainName = 'trackit.io';

    await expect(
      useCase.createCDNOrigin({
        eventId,
        cdnDistributionId,
        packageDomainName
      })
    ).rejects.toThrow(EventDoesNotExistError);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const taskTokensRepository = inject(tokenTaskTokensRepositoryInMemory);
  const CDNDistributionsManager = inject(tokenCDNDistributionsManagerFake);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);

  const useCase = new CreateCDNOriginUseCaseImpl();

  return {
    eventsRepository,
    taskTokensRepository,
    CDNDistributionsManager,
    useCase,
    eventUpdateSender,
  };
};
