import { register, reset } from '@trackflix-live/di';
import { tokenDeleteCDNOriginUseCase } from '@trackflix-live/api-events';
import { DeleteCloudFrontOriginAdapter } from './deleteCloudFrontOrigin.adapter';

describe('Delete CloudFront origin', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9c6c0f2c-c9bf-45ce-8d8b-211929b85653';
    const cdnDistributionId = 'test-distribution-id';

    await adapter.handle({
      eventId,
      cdnDistributionId,
    });

    expect(useCase.deleteCDNOrigin).toHaveBeenCalledWith({
      eventId,
      cdnDistributionId,
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
