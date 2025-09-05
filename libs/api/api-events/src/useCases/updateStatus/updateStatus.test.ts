import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
} from '../../infrastructure';
import { UpdateStatusUseCaseImpl } from './updateStatus';
import {
  EventMother,
  EventStatus,
  EventUpdateAction,
} from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';
import * as allure from 'allure-js-commons';

describe('Update status use case', () => {
  it('should emit event', async () => {
    await allure.epic('MVP');
    await allure.feature('Live updates');
    await allure.story(
      'As a user, I want my user interface to update without refreshing the page'
    );
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { useCase, eventsRepository, eventUpdateSender } = setup();
    const event = EventMother.basic().build();

    await eventsRepository.createEvent(event);

    await useCase.updateStatus(event.id);

    const updatedEvent = await eventsRepository.getEvent(event.id);

    expect(eventUpdateSender.eventUpdates).toEqual([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: updatedEvent,
      },
    ]);
  });

  it('should update event status to TX', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to create a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { useCase, eventsRepository } = setup();
    const event = EventMother.basic().withStatus(EventStatus.PRE_TX).build();

    await eventsRepository.createEvent(event);

    await useCase.updateStatus(event.id);

    expect(eventsRepository.events[0].status).toBe(EventStatus.TX);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);
  const eventsRepository = inject(tokenEventsRepositoryInMemory);

  const useCase = new UpdateStatusUseCaseImpl();

  return {
    useCase,
    eventsRepository,
    eventUpdateSender,
  };
};
