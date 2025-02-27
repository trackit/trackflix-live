import { ListEventsUseCaseImpl } from './listEvents';
import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
} from '../../infrastructure';
import { EventMother, EventStatus } from '@trackflix-live/types';
import { inject, reset } from 'di';

describe('ListEvents use case', () => {
  it('should return a list of events', async () => {
    const { useCase, eventsRepository } = setup();

    const sampleEvent = EventMother.basic().build();
    await eventsRepository.createEvent(sampleEvent);

    const events = await useCase.listEvents({
      limit: 10,
    });

    expect(events.events).toEqual([sampleEvent]);
  });

  it('should return an empty list if there are no events', async () => {
    const { useCase } = setup();

    const events = await useCase.listEvents({
      limit: 10,
    });

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

    const events = await useCase.listEvents({ limit: 1 });

    expect(events.events).toHaveLength(1);
    expect(events.nextToken).toBeDefined();

    const nextEvents = await useCase.listEvents({
      limit: 3,
      nextToken: events.nextToken as string,
    });

    expect(nextEvents.events).toHaveLength(2);
    expect(nextEvents.nextToken).toBeNull();
  });

  it('should sort items in ascending order', async () => {
    const { useCase, eventsRepository } = setup();

    await eventsRepository.createEvent(
      EventMother.basic().withName('Event 2').build()
    );
    await eventsRepository.createEvent(
      EventMother.basic().withName('Event 1').build()
    );

    const events = await useCase.listEvents({
      limit: 10,
      sortBy: 'name',
      sortOrder: 'asc',
    });

    expect(events.events.map((event) => event.name)).toEqual([
      'Event 1',
      'Event 2',
    ]);
  });

  it('should sort items in descending order', async () => {
    const { useCase, eventsRepository } = setup();

    await eventsRepository.createEvent(
      EventMother.basic().withName('Event 1').build()
    );
    await eventsRepository.createEvent(
      EventMother.basic().withName('Event 2').build()
    );

    const events = await useCase.listEvents({
      limit: 10,
      sortBy: 'name',
      sortOrder: 'desc',
    });

    expect(events.events.map((event) => event.name)).toEqual([
      'Event 2',
      'Event 1',
    ]);
  });

  it('should sort items by name', async () => {
    const { useCase, eventsRepository } = setup();

    await eventsRepository.createEvent(
      EventMother.basic().withName('Event 2').build()
    );
    await eventsRepository.createEvent(
      EventMother.basic().withName('Event 1').build()
    );

    const events = await useCase.listEvents({
      limit: 10,
      sortBy: 'name',
    });

    expect(events.events.map((event) => event.name)).toEqual([
      'Event 1',
      'Event 2',
    ]);
  });

  it('should sort items by onAirStartTime', async () => {
    const { useCase, eventsRepository } = setup();

    await eventsRepository.createEvent(
      EventMother.basic().withOnAirStartTime('2025-01-01T00:00:00Z').build()
    );
    await eventsRepository.createEvent(
      EventMother.basic().withOnAirStartTime('2024-01-01T00:00:00Z').build()
    );

    const events = await useCase.listEvents({
      limit: 10,
      sortBy: 'onAirStartTime',
    });

    expect(events.events.map((event) => event.onAirStartTime)).toEqual([
      '2024-01-01T00:00:00Z',
      '2025-01-01T00:00:00Z',
    ]);
  });

  it('should sort items by onAirEndTime', async () => {
    const { useCase, eventsRepository } = setup();

    await eventsRepository.createEvent(
      EventMother.basic().withOnAirEndTime('2025-01-01T00:00:00Z').build()
    );
    await eventsRepository.createEvent(
      EventMother.basic().withOnAirEndTime('2024-01-01T00:00:00Z').build()
    );

    const events = await useCase.listEvents({
      limit: 10,
      sortBy: 'onAirEndTime',
    });

    expect(events.events.map((event) => event.onAirEndTime)).toEqual([
      '2024-01-01T00:00:00Z',
      '2025-01-01T00:00:00Z',
    ]);
  });

  it('should sort items by status', async () => {
    const { useCase, eventsRepository } = setup();

    await eventsRepository.createEvent(
      EventMother.basic().withStatus(EventStatus.PRE_TX).build()
    );
    await eventsRepository.createEvent(
      EventMother.basic().withStatus(EventStatus.POST_TX).build()
    );

    const events = await useCase.listEvents({
      limit: 10,
      sortBy: 'status',
    });

    expect(events.events.map((event) => event.status)).toEqual([
      EventStatus.POST_TX,
      EventStatus.PRE_TX,
    ]);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const eventsRepository = inject(tokenEventsRepositoryInMemory);

  const useCase = new ListEventsUseCaseImpl();

  return {
    eventsRepository,
    useCase,
  };
};
