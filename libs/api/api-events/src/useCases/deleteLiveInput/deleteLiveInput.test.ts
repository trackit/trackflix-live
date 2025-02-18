import {
  EventsRepositoryInMemory,
  LiveChannelsManagerFake,
} from '../../infrastructure';
import { DeleteLiveInputUseCaseImpl } from './deleteLiveInput';
import { EventMother } from '@trackflix-live/types';

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
});

const setup = () => {
  const liveChannelsManager = new LiveChannelsManagerFake();
  const eventsRepository = new EventsRepositoryInMemory();

  const useCase = new DeleteLiveInputUseCaseImpl({
    liveChannelsManager,
    eventsRepository,
  });

  return {
    liveChannelsManager,
    eventsRepository,
    useCase,
  };
};
