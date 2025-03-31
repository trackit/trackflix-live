import { register, reset } from '@trackflix-live/di';
import { tokenCreateCDNOriginUseCase } from '@trackflix-live/api-events';
import { CreateCloudFrontOriginAdapter } from './createCloudFrontOrigin.adapter';

describe('Create CloudFront origin', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9c6c0f2c-c9bf-45ce-8d8b-211929b85653';
    const packageDomainName = 'test.cloudfront.net';
    const liveChannelArn =
      'arn:aws:medialive:us-east-1:123456789012:channel:1234';
    const liveChannelId = '1234';
    const packageChannelId = 'abcd';

    await adapter.handle({
      eventId,
      liveChannelArn,
      liveChannelId,
      packageChannelId,
      packageDomainName,
    });

    expect(useCase.createCDNOrigin).toHaveBeenCalledWith({
      eventId,
      packageDomainName,
      liveChannelArn,
      liveChannelId,
      packageChannelId,
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
