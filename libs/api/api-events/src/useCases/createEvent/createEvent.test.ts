import { CreateEventUseCaseImpl } from './createEvent';
import {
  registerTestInfrastructure,
  tokenEventSchedulerStartFake,
  tokenEventSchedulerStopFake,
  tokenEventsRepositoryInMemory,
} from '../../infrastructure';
import { CreateEventMother } from './CreateEventMother';
import { tokenEventUpdateSenderFake } from '../../infrastructure';
import { EventStatus, EventUpdateAction } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';

describe('CreateEvent use case', () => {
  it('should save event', async () => {
    const { eventsRepository, useCase } = setup();

    await useCase.createEvent(
      CreateEventMother.basic().withName('Test event').build()
    );

    expect(eventsRepository.events).toMatchObject([
      {
        name: 'Test event',
        createdTime: expect.any(String),
        logs: [],
        endpoints: [],
        status: EventStatus.PRE_TX,
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
    const { eventSchedulerStart, useCase } = setup();

    await useCase.createEvent(
      CreateEventMother.basic()
        .withOnAirStartTime('2025-01-22T09:45:07.202Z')
        .build()
    );

    expect(eventSchedulerStart.scheduledEvents).toMatchObject([
      {
        time: new Date('2025-01-22T09:30:07.202Z'),
      },
    ]);
  });

  it('should schedule the destruction of resources after air', async () => {
    const { eventSchedulerStop, useCase } = setup();

    await useCase.createEvent(
      CreateEventMother.basic()
        .withOnAirEndTime('2025-01-22T09:45:07.202Z')
        .build()
    );

    expect(eventSchedulerStop.scheduledEvents).toMatchObject([
      {
        time: new Date('2025-01-22T09:45:07.202Z'),
      },
    ]);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const eventSchedulerStart = inject(tokenEventSchedulerStartFake);
  const eventSchedulerStop = inject(tokenEventSchedulerStopFake);
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);

  const useCase = new CreateEventUseCaseImpl();

  return {
    eventSchedulerStart,
    eventSchedulerStop,
    eventsRepository,
    eventUpdateSender,
    useCase,
  };
};
