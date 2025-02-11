import { ListEventsUseCaseImpl } from './listEvents';
import { EventsRepositoryInMemory } from '../../infrastructure/EventsRepositoryInMemory';
import { Event, EventStatus } from '@trackflix-live/types';

describe('ListEvents use case', () => {
  it('should return a list of events', async () => {
    const { useCase, sampleEvent, eventsRepository } = setup();

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
    const { useCase, sampleEvent, eventsRepository } = setup();

    const secondFakeEvent = {
      ...sampleEvent,
      id: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aae',
    };

    await eventsRepository.createEvent(sampleEvent);
    await eventsRepository.createEvent(secondFakeEvent);

    const events = await useCase.listEvents(1);

    expect(events.events).toEqual([sampleEvent]);
    expect(events.nextToken).toBe(secondFakeEvent.id);

    const nextEvents = await useCase.listEvents(
      1,
      events?.nextToken || undefined
    );

    expect(nextEvents.events).toEqual([secondFakeEvent]);
    expect(nextEvents.nextToken).toBeNull();
  });
});

const setup = () => {
  const eventsRepository = new EventsRepositoryInMemory();

  const useCase = new ListEventsUseCaseImpl({
    eventsRepository,
  });

  const sampleEvent: Event = {
    name: 'My first event',
    description: 'This is a sample testing event',
    onAirStartTime: new Date('2025-02-04T15:15:31.606Z'),
    onAirEndTime: new Date('2025-02-04T16:21:50.292Z'),
    source: {
      bucket: 'test',
      key: 'test',
    },
    id: 'e5b30161-9206-4f4c-a3cc-0dd8cd284aad',
    status: EventStatus.PRE_TX,
  };

  return {
    eventsRepository,
    useCase,
    sampleEvent,
  };
};
