import { HandleLiveChannelStateChangeUseCaseImpl } from './handleLiveChannelStateChange';
import {
  TaskTokensRepositoryInMemory,
  TransmissionsManagerFake,
} from '../../infrastructure';
describe('Handle live channel state change use case', () => {
  it('should do nothing if no task token exist', async () => {
    const { useCase } = setup();

    await expect(
      useCase.handleLiveChannelStateChange({
        channelArn: 'arn:aws:medialive:us-west-2:000000000000:channel:8626488',
        state: 'CREATED',
      })
    ).resolves.not.toThrow();
  });

  it('should consume task token and resume start transmission', async () => {
    const { useCase, taskTokensRepository, transmissionsManager } = setup();
    const channelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const state = 'CREATED';
    const taskToken = 'sample_task_token';
    const output = { test: 1234 };

    await taskTokensRepository.createTaskToken({
      channelArn,
      expectedStatus: state,
      taskToken,
      output,
    });

    await useCase.handleLiveChannelStateChange({
      channelArn,
      state,
    });

    expect(transmissionsManager.resumedStartedTransmissions).toEqual([
      {
        taskToken,
        output,
      },
    ]);
  });
});

const setup = () => {
  const taskTokensRepository = new TaskTokensRepositoryInMemory();
  const transmissionsManager = new TransmissionsManagerFake();
  const useCase = new HandleLiveChannelStateChangeUseCaseImpl({
    taskTokensRepository,
    transmissionsManager,
  });

  return {
    taskTokensRepository,
    transmissionsManager,
    useCase,
  };
};
