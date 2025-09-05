import { GetEventUseCaseImpl } from './getEvent';
import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
} from '../../infrastructure';
import { EventMother } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils/errors';
import * as allure from 'allure-js-commons';

describe('Get event use case', () => {
  it('should return the event requested', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a viewer, I want to view a live event');
    await allure.owner('Nathan de Balthasar');
    await allure.severity('normal');

    const { eventsRepository, useCase } = setup();

    const event = EventMother.basic().build();
    await eventsRepository.createEvent(event);

    const result = await useCase.getEvent(event.id);

    expect(result).toEqual(event);
  });

  it('should throw an error if the event does not exist', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a viewer, I want to view a live event');
    await allure.owner('Nathan de Balthasar');
    await allure.severity('normal');

    const { useCase } = setup();

    await expect(useCase.getEvent('non-existing-id')).rejects.toThrow(
      EventDoesNotExistError
    );
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const eventsRepository = inject(tokenEventsRepositoryInMemory);

  const useCase = new GetEventUseCaseImpl();

  return {
    eventsRepository,
    useCase,
  };
};
