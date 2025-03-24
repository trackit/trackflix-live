import { CreateCloudFrontDistributionAdapter } from './createCloudFrontDistribution.adapter';
import { register, reset } from '@trackflix-live/di';
import { tokenCreateCDNDistributionUseCase } from '@trackflix-live/api-events';

describe('Create CloudFront distribution', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const cdnDistributionId = 'E2QWRUHXPO1PLV';

    useCase.createCDNDistribution.mockImplementation(() => ({
      cdnDistributionId,
    }));

    const result = await adapter.handle();

    expect(result).toEqual({
      cdnDistributionId,
    });
    expect(useCase.createCDNDistribution).toHaveBeenCalled();
  });
});

const setup = () => {
  reset();

  const useCase = {
    createCDNDistribution: jest.fn(),
  };
  register(tokenCreateCDNDistributionUseCase, { useValue: useCase });

  const adapter = new CreateCloudFrontDistributionAdapter();

  return {
    useCase,
    adapter,
  };
};
