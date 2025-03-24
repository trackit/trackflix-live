import { register, reset } from '@trackflix-live/di';
import { tokenCreateCDNOriginUseCase } from '@trackflix-live/api-events';
import { CreateCloudFrontOriginAdapter } from './createCloudFrontOrigin.adapter';

describe('Create CloudFront origin', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9c6c0f2c-c9bf-45ce-8d8b-211929b85653';
    const cdnDistributionId = 'E2QWRUHXPO1PLV';
    const packageDomainName = 'test.cloudfront.net';

    await adapter.handle({
      input: {
        eventId,
        cdnDistributionId,
        packageDomainName,
      },
    });

    expect(useCase.createCDNOrigin).toHaveBeenCalledWith({
      eventId,
      cdnDistributionId,
      packageDomainName,
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    createCDNOrigin: jest.fn(),
  };
  register(tokenCreateCDNOriginUseCase, { useValue: useCase });

  const adapter = new CreateCloudFrontOriginAdapter();

  return {
    useCase,
    adapter,
  };
};
