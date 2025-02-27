import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenPackageChannelsManagerFake,
} from '../../infrastructure';
import { DeletePackageChannelUseCaseImpl } from './deletePackageChannel';
import {
  EventMother,
  EventStatus,
  EventUpdateAction,
  LogType,
} from '@trackflix-live/types';
import { inject, reset } from 'di';

describe('Delete live channel use case', () => {
  it('should delete live channel', async () => {
    const { packageChannelsManager, eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).build()
    );

    await useCase.deletePackageChannel({
      eventId,
    });

    expect(packageChannelsManager.deletedChannels).toEqual([eventId]);
  });

  it('should update event status', async () => {
    const { eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).build()
    );

    await useCase.deletePackageChannel({
      eventId,
    });

    expect(eventsRepository.events).toMatchObject([
      {
        id: eventId,
        status: EventStatus.ENDED,
      },
    ]);
  });

  it('should update event destroyed time', async () => {
    const { eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).build()
    );

    await useCase.deletePackageChannel({
      eventId,
    });

    expect(eventsRepository.events).toMatchObject([
      {
        id: eventId,
        destroyedTime: expect.any(String),
      },
    ]);
  });

  it('should append to event logs', async () => {
    const { eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).build()
    );

    await useCase.deletePackageChannel({
      eventId,
    });

    expect(eventsRepository.events).toMatchObject([
      {
        id: eventId,
        destroyedTime: expect.any(String),
        logs: [
          {
            timestamp: expect.any(Number),
            type: LogType.PACKAGE_CHANNEL_DESTROYED,
          },
        ],
      },
    ]);
  });

  it('should emit update', async () => {
    const { eventsRepository, eventUpdateSender, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).build()
    );

    await useCase.deletePackageChannel({
      eventId,
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
  const packageChannelsManager = inject(tokenPackageChannelsManagerFake);
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);

  const useCase = new DeletePackageChannelUseCaseImpl();

  return {
    packageChannelsManager,
    eventsRepository,
    eventUpdateSender,
    useCase,
  };
};
