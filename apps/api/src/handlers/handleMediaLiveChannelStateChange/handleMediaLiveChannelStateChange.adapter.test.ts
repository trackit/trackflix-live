import { HandleMediaLiveChannelStateChangeAdapter } from './handleMediaLiveChannelStateChange.adapter';
import { EventBridgeEvent } from 'aws-lambda';
import { register, reset } from '@trackflix-live/di';
import { tokenHandleLiveChannelStateChangeUseCase } from '@trackflix-live/api-events';

describe('Handle MediaLive channel state change adapter', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();
    const channelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const state = 'CREATED';

    await adapter.handle({
      'detail-type': 'MediaLive Channel State Change',
      detail: {
        channel_arn: channelArn,
        state,
      },
    } as EventBridgeEvent<
      'MediaLive Channel State Change',
      {
        channel_arn: string;
        state: 'CREATED' | 'RUNNING' | 'STOPPING' | 'STOPPED';
      }
    >);

    expect(useCase.handleLiveChannelStateChange).toHaveBeenCalledWith({
      channelArn,
      state,
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    handleLiveChannelStateChange: jest.fn(),
  };
  register(tokenHandleLiveChannelStateChangeUseCase, { useValue: useCase });

  const adapter = new HandleMediaLiveChannelStateChangeAdapter();

  return {
    adapter,
    useCase,
  };
};
