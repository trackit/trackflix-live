import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenLiveChannelsManagerFake,
} from '../../infrastructure';
import { DeleteLiveInputUseCaseImpl } from './deleteLiveInput';
import { EventMother, LogType } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';
import * as allure from 'allure-js-commons';

describe('Delete live input use case', () => {
  it('should delete live input', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to delete a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { liveChannelsManager, eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveInputId = '8626488';
    const liveWaitingInputId = '1234567';
    const event = EventMother.basic()
      .withId(eventId)
      .withLiveInputId(liveInputId)
      .withLiveWaitingInputId(liveWaitingInputId)
      .build();
    await eventsRepository.createEvent(event);

    await useCase.deleteLiveInput({
      eventId,
    });

    expect(liveChannelsManager.deletedInputs).toEqual([
      liveInputId,
      liveWaitingInputId,
    ]);
  });

  it('should throw if event does not exist', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to delete a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';

    await expect(
      useCase.deleteLiveInput({
        eventId,
      })
    ).rejects.toThrow('Event not found.');
  });

  it('should throw if event does not have live input id', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to delete a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

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

  it('should throw if event does not have live waiting input id', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to delete a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveInputId = '8626488';

    const event = EventMother.basic()
      .withId(eventId)
      .withLiveInputId(liveInputId)
      .withLiveWaitingInputId(undefined)
      .build();
    await eventsRepository.createEvent(event);

    await expect(
      useCase.deleteLiveInput({
        eventId,
      })
    ).rejects.toThrow('Missing live input ID.');
  });

  it('should add logs', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to delete a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveInputId = '8626488';
    const liveWaitingInputId = '1234567';
    const event = EventMother.basic()
      .withId(eventId)
      .withLiveInputId(liveInputId)
      .withLiveWaitingInputId(liveWaitingInputId)
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
    await allure.epic('MVP');
    await allure.feature('Live updates');
    await allure.story(
      'As a user, I want my user interface to update without refreshing the page'
    );
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { eventUpdateSender, eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveInputId = '8626488';
    const liveWaitingInputId = '1234567';

    const event = EventMother.basic()
      .withId(eventId)
      .withLiveInputId(liveInputId)
      .withLiveWaitingInputId(liveWaitingInputId)
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
