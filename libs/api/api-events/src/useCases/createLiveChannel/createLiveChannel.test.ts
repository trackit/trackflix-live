import { CreateLiveChannelUseCaseImpl } from './createLiveChannel';
import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenLiveChannelsManagerFake,
  tokenTaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { EventMother, EventUpdateAction } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';

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
    const liveWaitingInputId = '7654321';
    const onAirStartTime = '2025-02-28T10:29:23.890Z';

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .withSource(source)
        .withOnAirStartTime(onAirStartTime)
        .build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: liveInputId,
      waitingInputId: liveWaitingInputId,
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
      waitingInputId: liveWaitingInputId,
    });
    expect(liveChannelsManager.createdChannels).toEqual([
      {
        eventId,
        packageChannelId,
        source,
        onAirStartTime,
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
    const liveWaitingInputId = '7654321';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).withSource(source).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: liveInputId,
      waitingInputId: liveWaitingInputId,
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
    const liveWaitingInputId = '7654321';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).withSource(source).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: liveInputId,
      waitingInputId: liveWaitingInputId,
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
    const liveWaitingInputId = '7654321';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).withSource(source).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: liveInputId,
      waitingInputId: liveWaitingInputId,
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
        liveWaitingInputId,
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
    const liveWaitingInputId = '7654321';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).withSource(source).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: liveInputId,
      waitingInputId: liveWaitingInputId,
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
  reset();
  registerTestInfrastructure();
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const taskTokensRepository = inject(tokenTaskTokensRepositoryInMemory);
  const liveChannelsManager = inject(tokenLiveChannelsManagerFake);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);

  const useCase = new CreateLiveChannelUseCaseImpl();

  return {
    eventsRepository,
    taskTokensRepository,
    liveChannelsManager,
    useCase,
    eventUpdateSender,
  };
};
