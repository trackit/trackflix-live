import { DeleteMediaLiveChannelAdapter } from './deleteMediaLiveChannel.adapter';

describe('Delete MediaLive channel adapter', () => {
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
    expect(useCase.deleteLiveChannel).toHaveBeenCalledWith({
      eventId,
      taskToken,
    });
  });
});

const setup = () => {
  const useCase = {
    deleteLiveChannel: jest.fn(),
  };
  const adapter = new DeleteMediaLiveChannelAdapter({
    useCase,
  });
  return {
    useCase,
    adapter,
  };
};
