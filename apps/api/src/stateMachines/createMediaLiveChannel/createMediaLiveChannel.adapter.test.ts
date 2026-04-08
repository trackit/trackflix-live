import { CreateMediaLiveChannelAdapter } from './createMediaLiveChannel.adapter';
import { register, reset } from '@trackflix-live/di';
import { tokenCreateLiveChannelUseCase } from '@trackflix-live/api-events';

describe('Create MediaLive channel adapter', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const packageChannelId = '123456';
    const eventId = '9ce722b8-121f-4f9a-b2ee-3f94760abfd2';
    const taskToken = 'sample_task_token';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';

    useCase.createLiveChannel.mockImplementation(() => ({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
    }));

    const response = await adapter.handle({
      input: {
        packageChannelId,
        eventId,
        packageDomainName: 'example.com',
        endpoints: [],
      },
      taskToken,
    });

    expect(response).toEqual({
      eventId,
      liveChannelArn,
      liveChannelId,
      packageChannelId,
      endpoints: [],
      packageDomainName: 'example.com',
      verticalPackageChannelId: undefined,
      verticalPackageDomainName: undefined,
    });
    expect(useCase.createLiveChannel).toHaveBeenCalledWith({
      packageChannelId,
      eventId,
      taskToken,
      packageDomainName: 'example.com',
      endpoints: [],
    });
  });

  it('should pass vertical fields when provided', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9ce722b8-121f-4f9a-b2ee-3f94760abfd2';
    const taskToken = 'sample_task_token';

    useCase.createLiveChannel.mockImplementation(() => ({
      channelArn: 'arn:test',
      channelId: '123',
    }));

    const response = await adapter.handle({
      input: {
        packageChannelId: '123456',
        eventId,
        packageDomainName: 'example.com',
        verticalPackageChannelId: '789',
        verticalPackageDomainName: 'vert.example.com',
        endpoints: [],
      },
      taskToken,
    });

    expect(response.verticalPackageChannelId).toBe('789');
    expect(response.verticalPackageDomainName).toBe('vert.example.com');
    expect(useCase.createLiveChannel).toHaveBeenCalledWith(
      expect.objectContaining({
        verticalPackageChannelId: '789',
        verticalPackageDomainName: 'vert.example.com',
      })
    );
  });
});

const setup = () => {
  reset();

  const useCase = {
    createLiveChannel: vi.fn(),
  };
  register(tokenCreateLiveChannelUseCase, { useValue: useCase });

  const adapter = new CreateMediaLiveChannelAdapter();

  return {
    useCase,
    adapter,
  };
};
