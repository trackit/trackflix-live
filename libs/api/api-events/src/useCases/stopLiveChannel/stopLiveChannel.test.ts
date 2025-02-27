import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenLiveChannelsManagerFake,
  tokenTaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { StopLiveChannelUseCaseImpl } from './stopLiveChannel';
import {
  EventMother,
  EventStatus,
  EventUpdateAction,
} from '@trackflix-live/types';
import { inject, reset } from 'di';

describe('Stop live channel use case', () => {
  it('should stop live channel', async () => {
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

    await useCase.stopLiveChannel({
      eventId,
      taskToken: 'sample_task_token',
    });

    expect(liveChannelsManager.stoppedChannels).toEqual([liveChannelId]);
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

    await useCase.stopLiveChannel({
      eventId,
      taskToken,
    });

    expect(taskTokensRepository.taskTokens).toEqual([
      {
        channelArn: liveChannelArn,
        expectedStatus: 'STOPPED',
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
      useCase.stopLiveChannel({
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
      useCase.stopLiveChannel({
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
      useCase.stopLiveChannel({
        eventId,
        taskToken: 'sample_task_token',
      })
    ).rejects.toThrow('Missing live channel ID or live channel ARN.');
  });

  it('should emit update', async () => {
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

    await useCase.stopLiveChannel({
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

  it('should update status to POST_TX', async () => {
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

    await useCase.stopLiveChannel({
      eventId,
      taskToken: 'sample_task_token',
    });

    expect(eventsRepository.events).toMatchObject([
      {
        id: eventId,
        status: EventStatus.POST_TX,
      },
    ]);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const liveChannelsManager = inject(tokenLiveChannelsManagerFake);
  const taskTokensRepository = inject(tokenTaskTokensRepositoryInMemory);
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);

  const useCase = new StopLiveChannelUseCaseImpl();

  return {
    liveChannelsManager,
    taskTokensRepository,
    eventsRepository,
    useCase,
    eventUpdateSender,
  };
};
