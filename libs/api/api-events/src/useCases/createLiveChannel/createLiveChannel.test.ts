import { CreateLiveChannelUseCaseImpl } from './createLiveChannel';
import {
  EventsRepositoryInMemory,
  EventUpdateSenderFake,
  LiveChannelsManagerFake,
  TaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { EventMother, EventUpdateAction } from '@trackflix-live/types';

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
    const liveInputId = '1234567';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).withSource(source).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: liveInputId,
    });

    const response = await useCase.createLiveChannel({
      eventId,
      taskToken,
      packageChannelId,
    });

    expect(response).toEqual({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: liveInputId,
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
    const liveInputId = '1234567';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).withSource(source).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: liveInputId,
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

  it('should store logs after creating the live channel', async () => {
    const { useCase, eventsRepository, liveChannelsManager } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const taskToken = 'sample_task_token';
    const packageChannelId = '8354829';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';
    const source = 's3://f1-live-broadcasts/monaco-gp-2025-live.mp4';
    const liveInputId = '1234567';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).withSource(source).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: liveInputId,
    });

    await useCase.createLiveChannel({
      eventId,
      taskToken,
      packageChannelId,
    });

    expect(eventsRepository.events[0].logs).toEqual([
      {
        timestamp: expect.any(Number),
        type: 'LIVE_INPUT_CREATED',
      },
    ]);
  });

  it('should store resources ids after creating the live channel', async () => {
    const { useCase, eventsRepository, liveChannelsManager } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const taskToken = 'sample_task_token';
    const packageChannelId = '8354829';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';
    const source = 's3://f1-live-broadcasts/monaco-gp-2025-live.mp4';
    const liveInputId = '1234567';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).withSource(source).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: liveInputId,
    });

    await useCase.createLiveChannel({
      eventId,
      taskToken,
      packageChannelId,
    });

    expect(eventsRepository.events).toMatchObject([
      {
        liveChannelArn,
        liveChannelId,
        liveInputId,
      },
    ]);
  });

  it('should emit logs after creating the live channel', async () => {
    const {
      useCase,
      eventsRepository,
      liveChannelsManager,
      eventUpdateSender,
    } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const taskToken = 'sample_task_token';
    const packageChannelId = '8354829';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
    const liveChannelId = '8626488';
    const source = 's3://f1-live-broadcasts/monaco-gp-2025-live.mp4';
    const liveInputId = '1234567';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).withSource(source).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: liveInputId,
    });

    await useCase.createLiveChannel({
      eventId,
      taskToken,
      packageChannelId,
    });

    expect(eventUpdateSender.eventUpdates).toMatchObject([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: {
          id: eventId,
          logs: [
            {
              timestamp: expect.any(Number),
              type: 'LIVE_INPUT_CREATED',
            },
          ],
        },
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
  const eventUpdateSender = new EventUpdateSenderFake();

  const useCase = new CreateLiveChannelUseCaseImpl({
    eventsRepository,
    taskTokensRepository,
    liveChannelsManager,
    eventUpdateSender,
  });

  return {
    eventsRepository,
    taskTokensRepository,
    liveChannelsManager,
    useCase,
    eventUpdateSender,
  };
};
