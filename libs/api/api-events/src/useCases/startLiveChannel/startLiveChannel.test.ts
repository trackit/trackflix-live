import {
  EventsRepositoryInMemory,
  EventUpdateSenderFake,
  LiveChannelsManagerFake,
  TaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { StartLiveChannelUseCaseImpl } from './startLiveChannel';
import { EventMother, EventUpdateAction, LogType } from '@trackflix-live/types';

describe('Start live channel use case', () => {
  it('should start live channel', async () => {
    const { liveChannelsManager, useCase, eventsRepository } = setup();
    const event = EventMother.basic().build();
    const taskToken = 'sample_task_token';
    const packageChannelId = '8354829';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';

    await eventsRepository.createEvent(event);

    await useCase.startLiveChannel({
      eventId: event.id,
      liveChannelId,
      liveChannelArn,
      packageChannelId,
      taskToken,
    });

    expect(liveChannelsManager.startedChannels).toEqual([liveChannelId]);
  });

  it('should create task token', async () => {
    const { taskTokensRepository, useCase, eventsRepository } = setup();
    const taskToken = 'sample_task_token';
    const packageChannelId = '8354829';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';
    const event = EventMother.basic().build();

    await eventsRepository.createEvent(event);

    await useCase.startLiveChannel({
      eventId: event.id,
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
          eventId: event.id,
          liveChannelArn,
          liveChannelId,
          packageChannelId,
        },
        taskToken,
      },
    ]);
  });

  it('should store logs', async () => {
    const { useCase, eventsRepository } = setup();
    const taskToken = 'sample_task_token';
    const packageChannelId = '8354829';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';
    const event = EventMother.basic().build();

    await eventsRepository.createEvent(event);

    await useCase.startLiveChannel({
      eventId: event.id,
      liveChannelId,
      liveChannelArn,
      packageChannelId,
      taskToken,
    });

    expect(eventsRepository.events[0].logs).toEqual([
      {
        timestamp: expect.any(Number),
        type: LogType.LIVE_CHANNEL_STARTED,
      },
    ]);
  });

  it('should emit event', async () => {
    const { useCase, eventsRepository, eventUpdateSender } = setup();
    const taskToken = 'sample_task_token';
    const packageChannelId = '8354829';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';
    const event = EventMother.basic().build();

    await eventsRepository.createEvent(event);

    await useCase.startLiveChannel({
      eventId: event.id,
      liveChannelId,
      liveChannelArn,
      packageChannelId,
      taskToken,
    });

    expect(eventUpdateSender.eventUpdates).toEqual([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: eventsRepository.events[0],
      },
    ]);
  });
});

const setup = () => {
  const taskTokensRepository = new TaskTokensRepositoryInMemory();
  const liveChannelsManager = new LiveChannelsManagerFake();
  const eventUpdateSender = new EventUpdateSenderFake();
  const eventsRepository = new EventsRepositoryInMemory();

  const useCase = new StartLiveChannelUseCaseImpl({
    liveChannelsManager,
    taskTokensRepository,
    eventUpdateSender,
    eventsRepository,
  });

  return {
    taskTokensRepository,
    liveChannelsManager,
    useCase,
    eventsRepository,
    eventUpdateSender,
  };
};
