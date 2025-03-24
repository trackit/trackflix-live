import { DeleteCloudFrontDistributionAdapter } from './deleteCloudFrontDistribution.adapter';
import { register, reset } from '@trackflix-live/di';
import { tokenDeleteCDNDistributionUseCase } from '@trackflix-live/api-events';

describe('Delete CloudFront distribution adapter', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const cdnDistributionId = 'E2QWRUHXPO1PLV';

    await adapter.handle({
      input: {
        cdnDistributionId,
      },
    });

    expect(useCase.deleteCDNDistribution).toHaveBeenCalledWith({
      cdnDistributionId,
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    deleteCDNDistribution: jest.fn(),
  };
  register(tokenDeleteCDNDistributionUseCase, { useValue: useCase });

  const adapter = new DeleteCloudFrontDistributionAdapter();

  return {
    useCase,
    adapter,
  };
};
