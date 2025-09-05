import { SetErrorStatusAdapter } from './setErrorStatus.adapter';
import { register, reset } from '@trackflix-live/di';
import { tokenSetErrorStatusUseCase } from '@trackflix-live/api-events';
import * as allure from 'allure-js-commons';

describe('Set error status adapter', () => {
  it('should call use case', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to create a live event');
    await allure.story('As a creator, I want to delete a live event');
    await allure.owner('Nathan de Balthasar');
    await allure.severity('normal');

    const { useCase, adapter } = setup();
    const eventId = '9ce722b8-121f-4f9a-b2ee-3f94760abfd2';

    await adapter.handle({
      eventId,
    });

    expect(useCase.setErrorStatus).toHaveBeenCalledWith(eventId);
  });
});

const setup = () => {
  reset();

  const useCase = {
    setErrorStatus: jest.fn(),
  };
  register(tokenSetErrorStatusUseCase, { useValue: useCase });

  const adapter = new SetErrorStatusAdapter();

  return {
    useCase,
    adapter,
  };
};
