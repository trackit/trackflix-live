import { CreateEventUseCaseImpl } from './createEvent';
import { EventsRepositoryInMemory } from '../../infrastructure/EventsRepositoryInMemory';
import { EventSchedulerFake } from '../../infrastructure/EventSchedulerFake';
import { CreateEventMother } from './CreateEventMother';

describe('CreateEvent use case', () => {
  it('should save event', async () => {
    const { eventsRepository, useCase } = setup();

    await useCase.createEvent(
      CreateEventMother.basic().withName('Test event').build()
    );

    expect(eventsRepository.events).toMatchObject([
      {
        name: 'Test event',
      },
    ]);
  });

  it('should schedule the creation of resources one hour before air', async () => {
    const { eventScheduler, useCase } = setup();

    await useCase.createEvent(
      CreateEventMother.basic()
        .withOnAirStartTime(new Date('2025-01-22T09:47:07.202Z'))
        .build()
    );

    expect(eventScheduler.scheduledEvents).toMatchObject([
      {
        time: new Date('2025-01-22T08:47:07.202Z'),
      },
    ]);
  });
});

const setup = () => {
  const eventScheduler = new EventSchedulerFake();
  const eventsRepository = new EventsRepositoryInMemory();

  const useCase = new CreateEventUseCaseImpl({
    eventScheduler,
    eventsRepository,
  });

  return {
    eventScheduler,
    eventsRepository,
    useCase,
  };
};
