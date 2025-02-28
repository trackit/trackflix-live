import { DeleteEventUseCaseImpl } from './deleteEvent';
import { EventsRepositoryInMemory } from '../../infrastructure/EventsRepositoryInMemory';
import { EventMother, EventStatus } from '@trackflix-live/types';

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

  it('should throw an error if the event status is not PRE_TX', async () => {
    const { eventsRepository, useCase } = setup();

    const event = EventMother.basic().withStatus(EventStatus.POST_TX).build();
    await eventsRepository.createEvent(event);

    await expect(useCase.deleteEvent(event.id)).rejects.toThrow(
      'Event cannot be deleted'
    );
  });

  it('should throw an error if the current time is between onAirStartTime and onAirEndTime', async () => {
    const { eventsRepository, useCase } = setup();

    const event = EventMother.basic()
      .withOnAirStartTime('2025-01-01T00:00:00Z')
      .withOnAirEndTime('2025-01-01T01:00:00Z')
      .build();
    await eventsRepository.createEvent(event);

    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2025-01-01T00:30:00Z').getTime());

    await expect(useCase.deleteEvent(event.id)).rejects.toThrow(
      'Cannot delete event while it is on air'
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
