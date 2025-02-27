import { GetEventUseCaseImpl } from './getEvent';
import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
} from '../../infrastructure';
import { EventMother } from '@trackflix-live/types';
import { inject, reset } from 'di';

describe('Get event use case', () => {
  it('should return the event requested', async () => {
    const { eventsRepository, useCase } = setup();

    const event = EventMother.basic().build();
    await eventsRepository.createEvent(event);

    const result = await useCase.getEvent(event.id);

    expect(result).toEqual(event);
  });

  it('should return an undefined event if it does not exist', async () => {
    const { useCase } = setup();

    const result = await useCase.getEvent('non-existing-id');

    expect(result).toBeUndefined();
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
