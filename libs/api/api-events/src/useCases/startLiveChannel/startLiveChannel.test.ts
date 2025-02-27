import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenLiveChannelsManagerFake,
  tokenTaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { StartLiveChannelUseCaseImpl } from './startLiveChannel';
import { EventMother, EventUpdateAction, LogType } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';

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

  it('should store LIVE_CHANNEL_CREATED log event', async () => {
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
        type: LogType.LIVE_CHANNEL_CREATED,
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
  reset();
  registerTestInfrastructure();
  const taskTokensRepository = inject(tokenTaskTokensRepositoryInMemory);
  const liveChannelsManager = inject(tokenLiveChannelsManagerFake);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);
  const eventsRepository = inject(tokenEventsRepositoryInMemory);

  const useCase = new StartLiveChannelUseCaseImpl();

  return {
    taskTokensRepository,
    liveChannelsManager,
    useCase,
    eventsRepository,
    eventUpdateSender,
  };
};
