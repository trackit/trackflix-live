import { CreateEventUseCaseImpl } from './createEvent';
import { EventsRepositoryInMemory } from '../../infrastructure/EventsRepositoryInMemory';
import { EventSchedulerFake } from '../../infrastructure/EventSchedulerFake';
import { CreateEventMother } from './CreateEventMother';
import { EventUpdateSenderFake } from '../../infrastructure/EventUpdateSenderFake';
import { EventUpdateAction } from '@trackflix-live/types';

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

  it('should send a live update', async () => {
    const { useCase, eventUpdateSender } = setup();

    const event = await useCase.createEvent(
      CreateEventMother.basic().withName('Test event').build()
    );

    expect(eventUpdateSender.eventUpdates).toHaveLength(1);
    expect(eventUpdateSender.eventUpdates[0]).toEqual({
      action: EventUpdateAction.EVENT_UPDATE_CREATE,
      value: event,
    });
  });

  it('should schedule the creation of resources 15 minutes before air', async () => {
    const { eventScheduler, useCase } = setup();

    await useCase.createEvent(
      CreateEventMother.basic()
        .withOnAirStartTime('2025-01-22T09:45:07.202Z')
        .build()
    );

    expect(eventScheduler.scheduledEvents).toMatchObject([
      {
        time: new Date('2025-01-22T09:30:07.202Z'),
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
