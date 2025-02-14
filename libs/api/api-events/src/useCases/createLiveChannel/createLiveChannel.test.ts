import { CreateLiveChannelUseCaseImpl } from './createLiveChannel';
import {
  EventsRepositoryInMemory,
  LiveChannelsManagerFake,
  TaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { EventMother } from '@trackflix-live/types';

describe('Create live channel use case', () => {
  it('should create live channel', async () => {
    const { useCase, eventsRepository, liveChannelsManager } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const taskToken = 'sample_task_token';
    const packageChannelId = '8354829';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';
    const source = 's3://f1-live-broadcasts/monaco-gp-2025-live.mp4';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).withSource(source).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
    });

    const response = await useCase.createLiveChannel({
      eventId,
      taskToken,
      packageChannelId,
    });

    expect(response).toEqual({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
    });
    expect(liveChannelsManager.createdChannels).toEqual([
      {
        eventId,
        packageChannelId,
        source,
      },
    ]);
  });

  it('should create task token', async () => {
    const {
      useCase,
      eventsRepository,
      liveChannelsManager,
      taskTokensRepository,
    } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const taskToken = 'sample_task_token';
    const packageChannelId = '8354829';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';
    const source = 's3://f1-live-broadcasts/monaco-gp-2025-live.mp4';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).withSource(source).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
    });

    await useCase.createLiveChannel({
      eventId,
      taskToken,
      packageChannelId,
    });

    expect(taskTokensRepository.taskTokens).toEqual([
      {
        channelArn: liveChannelArn,
        expectedStatus: 'CREATED',
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

  it('should throw if event does not exist', async () => {
    const { useCase } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const taskToken = 'sample_task_token';
    const packageChannelId = '8354829';

    await expect(
      useCase.createLiveChannel({
        eventId,
        taskToken,
        packageChannelId,
      })
    ).rejects.toThrow('Event not found.');
  });
});

const setup = () => {
  const eventsRepository = new EventsRepositoryInMemory();
  const taskTokensRepository = new TaskTokensRepositoryInMemory();
  const liveChannelsManager = new LiveChannelsManagerFake();

  const useCase = new CreateLiveChannelUseCaseImpl({
    eventsRepository,
    taskTokensRepository,
    liveChannelsManager,
  });

  return {
    eventsRepository,
    taskTokensRepository,
    liveChannelsManager,
    useCase,
  };
};
