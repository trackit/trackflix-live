import { HandleLiveChannelStateChangeUseCaseImpl } from './handleLiveChannelStateChange';
import {
  registerTestInfrastructure,
  tokenTaskTokensRepositoryInMemory,
  tokenTransmissionsManagerFake,
} from '../../infrastructure';
import { inject, reset } from '@trackflix-live/di';
import * as allure from 'allure-js-commons';
describe('Handle live channel state change use case', () => {
  it('should do nothing if no task token exist', async () => {
    await allure.epic('Misc');
    await allure.feature('Task tokens management');
    await allure.story('Token consumer');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { useCase } = setup();

    await expect(
      useCase.handleLiveChannelStateChange({
        channelArn: 'arn:aws:medialive:us-west-2:000000000000:channel:8626488',
        state: 'CREATED',
      })
    ).resolves.not.toThrow();
  });

  it('should consume task token and resume start transmission', async () => {
    await allure.epic('Misc');
    await allure.feature('Task tokens management');
    await allure.story('Token consumer');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

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
  reset();
  registerTestInfrastructure();
  const taskTokensRepository = inject(tokenTaskTokensRepositoryInMemory);
  const transmissionsManager = inject(tokenTransmissionsManagerFake);

  const useCase = new HandleLiveChannelStateChangeUseCaseImpl();

  return {
    taskTokensRepository,
    transmissionsManager,
    useCase,
  };
};
