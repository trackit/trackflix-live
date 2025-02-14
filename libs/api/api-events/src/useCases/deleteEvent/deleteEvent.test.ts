import { DeleteEventUseCaseImpl } from './deleteEvent';
import { EventsRepositoryInMemory } from '../../infrastructure/EventsRepositoryInMemory';
import { EventMother } from '@trackflix-live/types';

describe('DeleteEvent use case', () => {
  it('should delete event', async () => {
    const { eventsRepository, useCase } = setup();

    const event = EventMother.basic().build();
    await eventsRepository.createEvent(event);
    expect(eventsRepository.events).toEqual([event]);

    await useCase.deleteEvent(event.id);
    expect(eventsRepository.events).toEqual([]);
  });

  it('should throw an error if the event does not exist', async () => {
    const { useCase } = setup();

    await expect(useCase.deleteEvent('non-existing-id')).rejects.toThrow(
      'Event not found'
    );
  });
});

const setup = () => {
  const eventsRepository = new EventsRepositoryInMemory();

  const useCase = new DeleteEventUseCaseImpl({
    eventsRepository,
  });

  return {
    eventsRepository,
    useCase,
  };
};
