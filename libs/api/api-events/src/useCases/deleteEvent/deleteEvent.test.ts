import { DeleteEventUseCaseImpl } from './deleteEvent';
import { tokenEventsRepositoryInMemory } from '../../infrastructure/EventsRepositoryInMemory';
import { EventMother, EventStatus } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';
import { tokenEventSchedulerDeleteFake } from '../../infrastructure/EventSchedulerFake';
import { registerTestInfrastructure } from '../../infrastructure';
import { EventDoesNotExistError } from '../../utils/errors';

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
      EventDoesNotExistError
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

  it('should throw an error if the current time is between onAirStartTime (-6min) and onAirEndTime', async () => {
    const { eventsRepository, useCase } = setup();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T04:56:00Z'));

    const event = EventMother.basic()
      .withOnAirStartTime('2025-01-01T05:00:00Z')
      .withOnAirEndTime('2025-01-01T06:00:00Z')
      .build();
    await eventsRepository.createEvent(event);

    await expect(useCase.deleteEvent(event.id)).rejects.toThrow(
      'Cannot delete event while it is on air'
    );
  });

  it('should delete schedules', async () => {
    const { eventsRepository, useCase, eventSchedulerDelete } = setup();

    const event = EventMother.basic().build();
    await eventsRepository.createEvent(event);

    await useCase.deleteEvent(event.id);
    expect(eventSchedulerDelete.scheduledEvents).toEqual([]);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const eventSchedulerDelete = inject(tokenEventSchedulerDeleteFake);

  const useCase = new DeleteEventUseCaseImpl();

  return {
    eventsRepository,
    useCase,
    eventSchedulerDelete,
  };
};
