import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
} from '../../infrastructure';
import { SaveResultsUseCaseImpl } from './saveResults';
import {
  EventMother,
  EventStatus,
  EventUpdateAction,
  LogType,
} from '@trackflix-live/types';
import { inject, reset } from 'di';

describe('Save results use case', () => {
  it('should store LIVE_CHANNEL_STARTED log event', async () => {
    const { useCase, eventsRepository } = setup();
    const event = EventMother.basic().build();

    await eventsRepository.createEvent(event);

    await useCase.saveResults(event.id);

    const updatedEvent = await eventsRepository.getEvent(event.id);

    expect(updatedEvent?.logs).toEqual([
      {
        timestamp: expect.any(Number),
        type: LogType.LIVE_CHANNEL_STARTED,
      },
    ]);
  });

  it('should emit event', async () => {
    const { useCase, eventsRepository, eventUpdateSender } = setup();
    const event = EventMother.basic().build();

    await eventsRepository.createEvent(event);

    await useCase.saveResults(event.id);

    const updatedEvent = await eventsRepository.getEvent(event.id);

    expect(eventUpdateSender.eventUpdates).toEqual([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: updatedEvent,
      },
    ]);
  });

  it('should update event status to TX', async () => {
    const { useCase, eventsRepository } = setup();
    const event = EventMother.basic().withStatus(EventStatus.PRE_TX).build();

    await eventsRepository.createEvent(event);

    await useCase.saveResults(event.id);

    expect(eventsRepository.events[0].status).toBe(EventStatus.TX);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);
  const eventsRepository = inject(tokenEventsRepositoryInMemory);

  const useCase = new SaveResultsUseCaseImpl();

  return {
    useCase,
    eventsRepository,
    eventUpdateSender,
  };
};
