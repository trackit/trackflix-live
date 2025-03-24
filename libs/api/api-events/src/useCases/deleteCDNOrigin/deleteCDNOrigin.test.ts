import { DeleteCDNOriginUseCaseImpl } from './deleteCDNOrigin';
import {
  registerTestInfrastructure,
  tokenCDNDistributionsManagerFake,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenTaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { EventMother, EventUpdateAction, LogType } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils/errors';

describe('Delete CDN origin use case', () => {
  it('should delete CDN origin', async () => {
    const { useCase, eventsRepository, CDNDistributionsManager } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const cdnDistributionId = 'E2QWRUHAPVYC32';

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .build()
    );

    await useCase.deleteCDNOrigin({
      eventId,
      cdnDistributionId
    });

    expect(CDNDistributionsManager.deletedOrigins).toEqual([
      {
        eventId,
        cdnDistributionId
      },
    ]);
  });

  it('should store logs after deleting the CDN origin', async () => {
    const { useCase, eventsRepository } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const cdnDistributionId = 'E2QWRUHAPVYC32';

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .build()
    );

    await useCase.deleteCDNOrigin({
      eventId,
      cdnDistributionId
    });

    expect(eventsRepository.events[0].logs).toEqual([
      {
        timestamp: expect.any(Number),
        type: LogType.CDN_ORIGIN_DESTROYED,
      },
    ]);
  });

  it('should emit logs after deleting the CDN origin', async () => {
    const {
      useCase,
      eventsRepository,
      eventUpdateSender,
    } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const cdnDistributionId = 'E2QWRUHAPVYC32';

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .build()
    );

    await useCase.deleteCDNOrigin({
      eventId,
      cdnDistributionId
    });

    expect(eventUpdateSender.eventUpdates).toMatchObject([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: {
          id: eventId,
          logs: [
            {
              timestamp: expect.any(Number),
              type: LogType.CDN_ORIGIN_DESTROYED,
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

    await expect(
      useCase.deleteCDNOrigin({
        eventId,
        cdnDistributionId
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

  const useCase = new DeleteCDNOriginUseCaseImpl();

  return {
    eventsRepository,
    taskTokensRepository,
    CDNDistributionsManager,
    useCase,
    eventUpdateSender,
  };
};
