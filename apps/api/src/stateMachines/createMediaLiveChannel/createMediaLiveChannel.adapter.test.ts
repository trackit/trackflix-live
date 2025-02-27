import { CreateMediaLiveChannelAdapter } from './createMediaLiveChannel.adapter';
import { register, reset } from 'di';
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
      },
      taskToken,
    });

    expect(response).toEqual({
      eventId,
      liveChannelArn,
      liveChannelId,
      packageChannelId,
    });
    expect(useCase.createLiveChannel).toHaveBeenCalledWith({
      packageChannelId,
      eventId,
      taskToken,
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    createLiveChannel: jest.fn(),
  };
  register(tokenCreateLiveChannelUseCase, { useValue: useCase });

  const adapter = new CreateMediaLiveChannelAdapter();

  return {
    useCase,
    adapter,
  };
};
