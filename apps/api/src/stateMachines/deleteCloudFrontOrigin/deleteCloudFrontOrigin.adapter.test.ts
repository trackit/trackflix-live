import { register, reset } from '@trackflix-live/di';
import { tokenDeleteCDNOriginUseCase } from '@trackflix-live/api-events';
import { DeleteCloudFrontOriginAdapter } from './deleteCloudFrontOrigin.adapter';
import * as allure from 'allure-js-commons';

describe('Delete CloudFront origin', () => {
  it('should call use case', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to delete a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { useCase, adapter } = setup();
    const eventId = '9c6c0f2c-c9bf-45ce-8d8b-211929b85653';

    await adapter.handle({
      eventId,
    });

    expect(useCase.deleteCDNOrigin).toHaveBeenCalledWith({
      eventId,
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    deleteCDNOrigin: jest.fn(),
  };
  register(tokenDeleteCDNOriginUseCase, { useValue: useCase });

  const adapter = new DeleteCloudFrontOriginAdapter();

  return {
    useCase,
    adapter,
  };
};
