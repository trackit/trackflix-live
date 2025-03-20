import { createCDNDistributionUseCaseImpl } from './createCDNDistribution';
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

describe('Create CDN distribution use case', () => {
  it('should create CDN distribution', async () => {
    const { useCase, eventsRepository, CDNDistributionsManager } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const packageDomainName = 'ef12a945743b4a46.mediapackage.us-west-2.amazonaws.com';
    const cdnDistributionId = 'E2QWRUHAPVYC32'; 

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .withPackageDomainName(packageDomainName)
        .build()
    );
    CDNDistributionsManager.setCreateDistributionResponse({
      cdnDistributionId
    });

    const response = await useCase.createCDNDistribution({
      eventId,
      packageDomainName,
    });

    expect(response).toEqual({
      cdnDistributionId
    });
    expect(CDNDistributionsManager.createdDistributions).toEqual([
      {
        eventId,
        packageDomainName
      },
    ]);
  });

  it('should store logs after creating the CDN distribution', async () => {
    const { useCase, eventsRepository, CDNDistributionsManager } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const packageDomainName = 'ef12a945743b4a46.mediapackage.us-west-2.amazonaws.com';
    const cdnDistributionId = 'E2QWRUHAPVYC32';

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .withPackageDomainName(packageDomainName)
        .build()
    );
    CDNDistributionsManager.setCreateDistributionResponse({
      cdnDistributionId
    });

    await useCase.createCDNDistribution({
      eventId,
      packageDomainName,
    });

    expect(eventsRepository.events[0].logs).toEqual([
      {
        timestamp: expect.any(Number),
        type: 'CDN_DISTRIBUTION_CREATED',
      },
    ]);
  });

  it('should store distribution id after creating the CDN distribution', async () => {
    const { useCase, eventsRepository, CDNDistributionsManager } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const packageDomainName = 'ef12a945743b4a46.mediapackage.us-west-2.amazonaws.com';
    const cdnDistributionId = 'E2QWRUHAPVYC32';

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .withPackageDomainName(packageDomainName)
        .build()
    );
    CDNDistributionsManager.setCreateDistributionResponse({
      cdnDistributionId
    });

    await useCase.createCDNDistribution({
      eventId,
      packageDomainName,
    });

    expect(eventsRepository.events).toMatchObject([
      {
        CDNDistributionId: cdnDistributionId
      },
    ]);
  });

  it('should emit logs after creating the CDN distribution', async () => {
    const {
      useCase,
      eventsRepository,
      CDNDistributionsManager,
      eventUpdateSender,
    } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const packageDomainName = 'ef12a945743b4a46.mediapackage.us-west-2.amazonaws.com';
    const cdnDistributionId = 'E2QWRUHAPVYC32';

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .withPackageDomainName(packageDomainName)
        .build()
    );
    CDNDistributionsManager.setCreateDistributionResponse({
      cdnDistributionId
    });

    await useCase.createCDNDistribution({
      eventId,
      packageDomainName,
    });

    expect(eventUpdateSender.eventUpdates).toMatchObject([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: {
          id: eventId,
          logs: [
            {
              timestamp: expect.any(Number),
              type: 'CDN_DISTRIBUTION_CREATED',
            },
          ],
        },
      },
    ]);
  });

  it('should throw if event does not exist', async () => {
    const { useCase } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const packageDomainName = 'ef12a945743b4a46.mediapackage.us-west-2.amazonaws.com';

    await expect(
      useCase.createCDNDistribution({
        eventId,
        packageDomainName,
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

  const useCase = new createCDNDistributionUseCaseImpl();

  return {
    eventsRepository,
    taskTokensRepository,
    CDNDistributionsManager,
    useCase,
    eventUpdateSender,
  };
};
