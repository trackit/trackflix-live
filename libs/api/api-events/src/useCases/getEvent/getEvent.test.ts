import { GetEventUseCaseImpl } from './getEvent';
import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
} from '../../infrastructure';
import { EventMother } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils/errors';

describe('Get event use case', () => {
  it('should return the event requested', async () => {
    const { eventsRepository, useCase } = setup();

    const event = EventMother.basic().build();
    await eventsRepository.createEvent(event);

    const result = await useCase.getEvent(event.id);

    expect(result).toEqual(event);
  });

  it('should throw an error if the event does not exist', async () => {
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
