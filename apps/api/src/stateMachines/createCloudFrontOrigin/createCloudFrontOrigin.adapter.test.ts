import { register, reset } from '@trackflix-live/di';
import { tokenCreateCDNOriginUseCase } from '@trackflix-live/api-events';
import { CreateCloudFrontOriginAdapter } from './createCloudFrontOrigin.adapter';
import { EndpointType, EventEndpoint } from '@trackflix-live/types';

describe('Create CloudFront origin', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9c6c0f2c-c9bf-45ce-8d8b-211929b85653';
    const packageDomainName = 'test.cloudfront.net';
    const cdnDistributionId = 'E1ABCDEFGHIJKL';
    const endpoints: EventEndpoint[] = [
      { url: 'https://example.com/hls', type: EndpointType.HLS },
      { url: 'https://example.com/dash', type: EndpointType.DASH },
    ];

    await adapter.handle({
      eventId,
      packageDomainName,
      endpoints,
      cdnDistributionId,
    });

    expect(useCase.createCDNOrigin).toHaveBeenCalledWith({
      eventId,
      packageDomainName,
      endpoints,
      cdnDistributionId,
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
