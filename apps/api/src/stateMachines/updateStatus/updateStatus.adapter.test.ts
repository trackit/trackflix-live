import { UpdateStatusAdapter } from './updateStatus.adapter';
import { register, reset } from '@trackflix-live/di';
import { tokenUpdateStatusUseCase } from '@trackflix-live/api-events';
import * as allure from 'allure-js-commons';

describe('Update status adapter', () => {
  it('should call use case', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to create a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { useCase, adapter } = setup();
    const eventId = '9ce722b8-121f-4f9a-b2ee-3f94760abfd2';

    await adapter.handle({
      eventId,
    });

    expect(useCase.updateStatus).toHaveBeenCalledWith(eventId);
  });
});

const setup = () => {
  reset();

  const useCase = {
    updateStatus: jest.fn(),
  };
  register(tokenUpdateStatusUseCase, { useValue: useCase });

  const adapter = new UpdateStatusAdapter();

  return {
    useCase,
    adapter,
  };
};
