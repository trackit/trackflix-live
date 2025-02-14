import {
  LiveChannelsManagerFake,
  TaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { StartLiveChannelUseCaseImpl } from './startLiveChannel';

describe('Start live channel use case', () => {
  it('should start live channel', async () => {
    const { liveChannelsManager, useCase } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const taskToken = 'sample_task_token';
    const packageChannelId = '8354829';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';

    await useCase.startLiveChannel({
      eventId,
      liveChannelId,
      liveChannelArn,
      packageChannelId,
      taskToken,
    });

    expect(liveChannelsManager.startedChannels).toEqual([liveChannelId]);
  });

  it('should create task token', async () => {
    const { taskTokensRepository, useCase } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const taskToken = 'sample_task_token';
    const packageChannelId = '8354829';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';

    await useCase.startLiveChannel({
      eventId,
      liveChannelId,
      liveChannelArn,
      packageChannelId,
      taskToken,
    });

    expect(taskTokensRepository.taskTokens).toEqual([
      {
        channelArn: liveChannelArn,
        expectedStatus: 'RUNNING',
        output: {
          eventId,
          liveChannelArn,
          liveChannelId,
          packageChannelId,
        },
        taskToken,
      },
    ]);
  });
});

const setup = () => {
  const taskTokensRepository = new TaskTokensRepositoryInMemory();
  const liveChannelsManager = new LiveChannelsManagerFake();

  const useCase = new StartLiveChannelUseCaseImpl({
    liveChannelsManager,
    taskTokensRepository,
  });

  return {
    taskTokensRepository,
    liveChannelsManager,
    useCase,
  };
};
