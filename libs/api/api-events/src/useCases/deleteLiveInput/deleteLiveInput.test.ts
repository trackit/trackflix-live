import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenLiveChannelsManagerFake,
} from '../../infrastructure';
import { DeleteLiveInputUseCaseImpl } from './deleteLiveInput';
import { EventMother, LogType } from '@trackflix-live/types';
import { inject, reset } from 'di';

describe('Delete live input use case', () => {
  it('should delete live input', async () => {
    const { liveChannelsManager, eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveInputId = '8626488';
    const event = EventMother.basic()
      .withId(eventId)
      .withLiveInputId(liveInputId)
      .build();
    await eventsRepository.createEvent(event);

    await useCase.deleteLiveInput({
      eventId,
    });

    expect(liveChannelsManager.deletedInputs).toEqual([liveInputId]);
  });

  it('should throw if event does not exist', async () => {
    const { useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';

    await expect(
      useCase.deleteLiveInput({
        eventId,
      })
    ).rejects.toThrow('Event not found.');
  });

  it('should throw if event does not have live input id', async () => {
    const { eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';

    const event = EventMother.basic()
      .withId(eventId)
      .withLiveInputId(undefined)
      .build();
    await eventsRepository.createEvent(event);

    await expect(
      useCase.deleteLiveInput({
        eventId,
      })
    ).rejects.toThrow('Missing live input ID.');
  });

  it('should add logs', async () => {
    const { eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveInputId = '8626488';
    const event = EventMother.basic()
      .withId(eventId)
      .withLiveInputId(liveInputId)
      .build();
    await eventsRepository.createEvent(event);

    await useCase.deleteLiveInput({
      eventId,
    });

    expect(eventsRepository.events).toMatchObject([
      {
        id: eventId,
        logs: [
          {
            timestamp: expect.any(Number),
            type: LogType.LIVE_CHANNEL_DESTROYED,
          },
          {
            timestamp: expect.any(Number),
            type: LogType.LIVE_INPUT_DESTROYED,
          },
        ],
      },
    ]);
  });

  it('should emit updates', async () => {
    const { eventUpdateSender, eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveInputId = '8626488';
    const event = EventMother.basic()
      .withId(eventId)
      .withLiveInputId(liveInputId)
      .build();
    await eventsRepository.createEvent(event);

    await useCase.deleteLiveInput({
      eventId,
    });

    expect(eventUpdateSender.eventUpdates).toMatchObject([
      {
        action: 'EVENT_UPDATE_UPDATE',
        value: {
          id: eventId,
          logs: [
            {
              timestamp: expect.any(Number),
              type: LogType.LIVE_CHANNEL_DESTROYED,
            },
          ],
        },
      },
      {
        action: 'EVENT_UPDATE_UPDATE',
        value: {
          id: eventId,
          logs: [
            {
              timestamp: expect.any(Number),
              type: LogType.LIVE_CHANNEL_DESTROYED,
            },
            {
              timestamp: expect.any(Number),
              type: LogType.LIVE_INPUT_DESTROYED,
            },
          ],
        },
      },
    ]);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const liveChannelsManager = inject(tokenLiveChannelsManagerFake);
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);

  const useCase = new DeleteLiveInputUseCaseImpl();

  return {
    liveChannelsManager,
    eventsRepository,
    eventUpdateSender,
    useCase,
  };
};
