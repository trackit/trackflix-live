import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
} from '../../infrastructure';
import { SetErrorStatusUseCaseImpl } from './setErrorStatus';
import {
  EventMother,
  EventStatus,
  EventUpdateAction,
  LogType,
} from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';

describe('Set error status use case', () => {
  it('should set event status to ERROR', async () => {
    const { useCase, eventsRepository } = setup();
    const eventValues = EventMother.basic()
      .withId('9ce722b8-121f-4f9a-b2ee-3f94760abfd2')
      .withStatus(EventStatus.PRE_TX)
      .build();

    await eventsRepository.createEvent(eventValues);

    const event = await eventsRepository.getEvent(eventValues.id);
    expect(event?.status).toEqual(EventStatus.PRE_TX);

    await useCase.setErrorStatus(eventValues.id);

    const updatedEvent = await eventsRepository.getEvent(eventValues.id);
    expect(updatedEvent?.status).toEqual(EventStatus.ERROR);
  });

  it('should add logs', async () => {
    const { useCase, eventsRepository } = setup();

    const event = EventMother.basic().build();
    await eventsRepository.createEvent(event);

    await useCase.setErrorStatus(event.id);

    expect(eventsRepository.events).toMatchObject([
      {
        id: event.id,
        logs: [
          {
            timestamp: expect.any(Number),
            type: LogType.EVENT_ERROR_OCCURED,
          },
        ],
      },
    ]);
  });

  it('should send live update', async () => {
    const { useCase, eventsRepository, eventUpdateSender } = setup();
    const event = EventMother.basic().build();

    await eventsRepository.createEvent(event);

    await useCase.setErrorStatus(event.id);

    const updatedEvent = await eventsRepository.getEvent(event.id);

    expect(eventUpdateSender.eventUpdates).toEqual([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: updatedEvent,
      },
    ]);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);
  const eventsRepository = inject(tokenEventsRepositoryInMemory);

  const useCase = new SetErrorStatusUseCaseImpl();

  return {
    useCase,
    eventsRepository,
    eventUpdateSender,
  };
};
