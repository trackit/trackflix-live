import { createCloudFrontDistributionAdapter } from './createCloudFrontDistribution.adapter';
import { register, reset } from '@trackflix-live/di';
import { tokencreateCDNDistributionUseCase } from '@trackflix-live/api-events';

describe('Create CloudFront distribution', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9c6c0f2c-c9bf-45ce-8d8b-211929b85653';
    const cdnDistributionId = 'E2QWRUHXPO1PLV';

    useCase.createCDNDistribution.mockImplementation(() => ({
      cdnDistributionId
    }));

    const result = await adapter.handle({
      input: {
        eventId,
        packageDomainName: 'sample.domain.com',
      }
    });

    expect(result).toEqual({
      eventId,
      cdnDistributionId,
    });
    expect(useCase.createCDNDistribution).toHaveBeenCalledWith({
      eventId,
      packageDomainName: 'sample.domain.com',
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    createCDNDistribution: jest.fn(),
  };
  register(tokencreateCDNDistributionUseCase, { useValue: useCase });

  const adapter = new createCloudFrontDistributionAdapter();

  return {
    useCase,
    adapter,
  };
};
