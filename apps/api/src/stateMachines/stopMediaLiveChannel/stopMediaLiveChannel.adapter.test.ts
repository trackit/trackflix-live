import { StopMediaLiveChannelAdapter } from './stopMediaLiveChannel.adapter';
import { register, reset } from '@trackflix-live/di';
import { tokenStopLiveChannelUseCase } from '@trackflix-live/api-events';

describe('Stop MediaLive channel adapter', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const eventId = '9ce722b8-121f-4f9a-b2ee-3f94760abfd2';
    const taskToken = 'sample_task_token';

    const result = await adapter.handle({
      input: {
        eventId,
      },
      taskToken,
    });

    expect(result).toEqual({
      eventId,
    });
    expect(useCase.stopLiveChannel).toHaveBeenCalledWith({
      eventId,
      taskToken,
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    stopLiveChannel: jest.fn(),
  };
  register(tokenStopLiveChannelUseCase, { useValue: useCase });

  const adapter = new StopMediaLiveChannelAdapter();

  return {
    useCase,
    adapter,
  };
};
