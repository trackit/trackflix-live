import {
  EventsRepositoryInMemory,
  EventUpdateSenderFake,
  LiveChannelsManagerFake,
  TaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { DeleteLiveChannelUseCaseImpl } from './deleteLiveChannel';
import { EventMother, EventUpdateAction, LogType } from '@trackflix-live/types';

describe('Delete live channel use case', () => {
  it('should delete live channel', async () => {
    const { liveChannelsManager, eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';
    const event = EventMother.basic()
      .withId(eventId)
      .withLiveChannelArn(liveChannelArn)
      .withLiveChannelId(liveChannelId)
      .build();
    await eventsRepository.createEvent(event);

    await useCase.deleteLiveChannel({
      eventId,
      taskToken: 'sample_task_token',
    });

    expect(liveChannelsManager.deletedChannels).toEqual([liveChannelId]);
  });

  it('should create task token', async () => {
    const { eventsRepository, taskTokensRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';
    const taskToken = 'sample_task_token';

    const event = EventMother.basic()
      .withId(eventId)
      .withLiveChannelArn(liveChannelArn)
      .withLiveChannelId(liveChannelId)
      .build();
    await eventsRepository.createEvent(event);

    await useCase.deleteLiveChannel({
      eventId,
      taskToken,
    });

    expect(taskTokensRepository.taskTokens).toEqual([
      {
        channelArn: liveChannelArn,
        expectedStatus: 'DELETED',
        output: {
          eventId,
        },
        taskToken,
      },
    ]);
  });

  it('should throw if event does not exist', async () => {
    const { useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';

    await expect(
      useCase.deleteLiveChannel({
        eventId,
        taskToken: 'sample_task_token',
      })
    ).rejects.toThrow('Event not found.');
  });

  it('should throw if event does not have live channel id', async () => {
    const { eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';

    const event = EventMother.basic()
      .withId(eventId)
      .withLiveChannelArn(liveChannelArn)
      .withLiveChannelId(undefined)
      .build();
    await eventsRepository.createEvent(event);

    await expect(
      useCase.deleteLiveChannel({
        eventId,
        taskToken: 'sample_task_token',
      })
    ).rejects.toThrow('Missing live channel ID or live channel ARN.');
  });

  it('should throw if event does not have live channel arn', async () => {
    const { eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveChannelId = '8626488';

    const event = EventMother.basic()
      .withId(eventId)
      .withLiveChannelArn(undefined)
      .withLiveChannelId(liveChannelId)
      .build();
    await eventsRepository.createEvent(event);

    await expect(
      useCase.deleteLiveChannel({
        eventId,
        taskToken: 'sample_task_token',
      })
    ).rejects.toThrow('Missing live channel ID or live channel ARN.');
  });

  it('should append live channel stopped log', async () => {
    const { eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';
    const event = EventMother.basic()
      .withId(eventId)
      .withLiveChannelArn(liveChannelArn)
      .withLiveChannelId(liveChannelId)
      .build();
    await eventsRepository.createEvent(event);

    await useCase.deleteLiveChannel({
      eventId,
      taskToken: 'sample_task_token',
    });

    expect(eventsRepository.events[0].logs).toEqual([
      {
        timestamp: expect.any(Number),
        type: LogType.LIVE_CHANNEL_STOPPED,
      },
    ]);
  });

  it('should emit live update', async () => {
    const { eventUpdateSender, eventsRepository, useCase } = setup();
    const eventId = '51b09cc5-4d24-452c-9198-216a2a06dd6d';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';
    const event = EventMother.basic()
      .withId(eventId)
      .withLiveChannelArn(liveChannelArn)
      .withLiveChannelId(liveChannelId)
      .build();
    await eventsRepository.createEvent(event);

    await useCase.deleteLiveChannel({
      eventId,
      taskToken: 'sample_task_token',
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
  const liveChannelsManager = new LiveChannelsManagerFake();
  const taskTokensRepository = new TaskTokensRepositoryInMemory();
  const eventsRepository = new EventsRepositoryInMemory();
  const eventUpdateSender = new EventUpdateSenderFake();

  const useCase = new DeleteLiveChannelUseCaseImpl({
    liveChannelsManager,
    taskTokensRepository,
    eventsRepository,
    eventUpdateSender,
  });

  return {
    liveChannelsManager,
    taskTokensRepository,
    eventsRepository,
    eventUpdateSender,
    useCase,
  };
};
