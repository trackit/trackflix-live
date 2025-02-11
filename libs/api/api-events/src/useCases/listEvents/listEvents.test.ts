import { ListEventsUseCaseImpl } from './listEvents';
import { EventsRepositoryInMemory } from '../../infrastructure/EventsRepositoryInMemory';
import { Event, EventMother, EventStatus } from '@trackflix-live/types';

describe('ListEvents use case', () => {
  it('should return a list of events', async () => {
    const { useCase, eventsRepository } = setup();

    const sampleEvent = EventMother.basic().build();
    await eventsRepository.createEvent(sampleEvent);

    const events = await useCase.listEvents(10);

    expect(events.events).toEqual([sampleEvent]);
  });

  it('should return an empty list if there are no events', async () => {
    const { useCase } = setup();

    const events = await useCase.listEvents(10);

    expect(events.events).toEqual([]);
  });

  it('should return event in multiple requests if the limit is less than the number of events', async () => {
    const { useCase, eventsRepository } = setup();

    await eventsRepository.createEvent(
      EventMother.basic().withId('e180523f-0d99-4e02-9471-f58aec1c38cf').build()
    );
    await eventsRepository.createEvent(
      EventMother.basic().withId('f2efc047-89b8-4628-8d78-7669f5b63342').build()
    );
    await eventsRepository.createEvent(
      EventMother.basic().withId('6f255021-f742-4526-80ce-5128f993c6d6').build()
    );

    const events = await useCase.listEvents(1);

    expect(events.events).toHaveLength(1);
    expect(events.nextToken).toBeDefined();

    const nextEvents = await useCase.listEvents(3, events.nextToken as string);

    expect(nextEvents.events).toHaveLength(2);
    expect(nextEvents.nextToken).toBeNull();
  });
});

const setup = () => {
  const eventsRepository = new EventsRepositoryInMemory();

  const useCase = new ListEventsUseCaseImpl({
    eventsRepository,
  });

  return {
    eventsRepository,
    useCase,
  };
};
