import { CreateEventUseCaseImpl } from './createEvent';
import { EventsRepositoryInMemory } from '../../infrastructure/EventsRepositoryInMemory';
import { EventSchedulerFake } from '../../infrastructure/EventSchedulerFake';
import { CreateEventMother } from './CreateEventMother';
import { EventUpdateSenderFake } from '../../infrastructure/EventUpdateSenderFake';
import { EventMother } from '@trackflix-live/types';

describe('CreateEvent use case', () => {
  it('should save event', async () => {
    const { eventsRepository, useCase, eventUpdateSender } = setup();

    const event = await useCase.createEvent(
      CreateEventMother.basic().withName('Test event').build()
    );

    expect(eventUpdateSender.eventUpdates).toHaveLength(1);
    expect(eventUpdateSender.eventUpdates[0]).toEqual({
      action: 'EVENT_UPDATE_CREATE',
      value: event,
    });
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
  const eventUpdateSender = new EventUpdateSenderFake();

  const useCase = new CreateEventUseCaseImpl({
    eventScheduler,
    eventsRepository,
    eventUpdateSender,
  });

  return {
    eventScheduler,
    eventsRepository,
    eventUpdateSender,
    useCase,
  };
};
