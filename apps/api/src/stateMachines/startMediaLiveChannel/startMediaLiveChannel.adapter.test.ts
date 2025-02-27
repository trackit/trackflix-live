import { StartMediaLiveChannelAdapter } from './startMediaLiveChannel.adapter';
import { register, reset } from '@trackflix-live/di';
import { tokenStartLiveChannelUseCase } from '@trackflix-live/api-events';

describe('Start MediaLive channel adapter', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const packageChannelId = '123456';
    const eventId = '9ce722b8-121f-4f9a-b2ee-3f94760abfd2';
    const taskToken = 'sample_task_token';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';

    const result = await adapter.handle({
      input: {
        eventId,
        packageChannelId,
        liveChannelArn,
        liveChannelId,
      },
      taskToken,
    });

    expect(result).toEqual({
      eventId,
      packageChannelId,
      liveChannelArn,
      liveChannelId,
    });
    expect(useCase.startLiveChannel).toHaveBeenCalledWith({
      eventId,
      packageChannelId,
      liveChannelArn,
      liveChannelId,
      taskToken,
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    startLiveChannel: jest.fn(),
  };
  register(tokenStartLiveChannelUseCase, { useValue: useCase });

  const adapter = new StartMediaLiveChannelAdapter();

  return {
    useCase,
    adapter,
  };
};
