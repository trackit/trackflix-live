import { register, reset } from '@trackflix-live/di';
import { tokenCreateCDNOriginUseCase } from '@trackflix-live/api-events';
import { CreateCloudFrontOriginAdapter } from './createCloudFrontOrigin.adapter';
import { EndpointType, EventEndpoint } from '@trackflix-live/types';

describe('Create CloudFront origin', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9c6c0f2c-c9bf-45ce-8d8b-211929b85653';
    const packageDomainName = 'test.cloudfront.net';
    const liveChannelArn =
      'arn:aws:medialive:us-east-1:123456789012:channel:1234';
    const liveChannelId = '1234';
    const packageChannelId = 'abcd';
    const endpoints: EventEndpoint[] = [
      { url: 'https://example.com/hls', type: EndpointType.HLS },
      { url: 'https://example.com/dash', type: EndpointType.DASH },
    ];

    await adapter.handle({
      eventId,
      liveChannelArn,
      liveChannelId,
      packageChannelId,
      packageDomainName,
      endpoints,
    });

    expect(useCase.createCDNOrigin).toHaveBeenCalledWith({
      eventId,
      packageDomainName,
      liveChannelArn,
      liveChannelId,
      packageChannelId,
      endpoints,
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
