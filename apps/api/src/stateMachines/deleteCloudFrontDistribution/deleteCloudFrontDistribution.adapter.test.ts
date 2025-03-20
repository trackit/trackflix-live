import { DeleteCloudFrontDistributionAdapter } from './deleteCloudFrontDistribution.adapter';
import { register, reset } from '@trackflix-live/di';
import { tokenDeleteCDNDistributionUseCase } from '@trackflix-live/api-events';

describe('Delete CloudFront distribution adapter', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9ce722b8-121f-4f9a-b2ee-3f94760abfd2';
    const cdnDistributionId = 'E2QWRUHXPO1PLV';

    const result = await adapter.handle({
      input: {
        eventId,
        cdnDistributionId,
      },
    });

    expect(result).toEqual({
      eventId,
    });
    expect(useCase.deleteCDNDistribution).toHaveBeenCalledWith({
      eventId,
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
