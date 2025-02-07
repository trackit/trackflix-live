import { GetEventUseCaseImpl } from './getEvent';
import { EventsRepositoryInMemory } from '../../infrastructure/EventsRepositoryInMemory';
import { EventMother } from '@trackflix-live/types';

describe('Get event use case', () => {
  it('should return the event requested', async () => {
    const { eventsRepository, useCase } = setup();

    const event = EventMother.basic().build();
    await eventsRepository.createEvent(event);

    const result = await useCase.getEvent(event.id);

    expect(result).toEqual(event);
  });

  it('should return an undefined event if it does not exist', async () => {
    const { useCase } = setup();

    const result = await useCase.getEvent('non-existing-id');

    expect(result).toBeUndefined();
  });
});

const setup = () => {
  const eventsRepository = new EventsRepositoryInMemory();

  const useCase = new GetEventUseCaseImpl({
    eventsRepository,
  });

  return {
    eventsRepository,
    useCase,
  };
};
