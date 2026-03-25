import { CreateLiveChannelUseCaseImpl } from './createLiveChannel';
import { DeleteLiveChannelUseCaseImpl } from '../deleteLiveChannel/deleteLiveChannel';
import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenLiveChannelsManagerFake,
  tokenTaskTokensRepositoryInMemory,
} from '../../infrastructure';
import {
  EventMother,
  EventUpdateAction,
  LogType,
} from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';

describe('Preservation: createLiveChannel', () => {
  it('should pass eventId, source, packageChannelId, and verticalPackageChannelId to createChannel', async () => {
    const { useCase, eventsRepository, liveChannelsManager } = setupCreate();
    const eventId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const source = 's3://bucket/video.mp4';
    const packageChannelId = '1111111';
    const verticalPackageChannelId = '2222222';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).withSource(source).build()
    );

    await useCase.createLiveChannel({
      eventId,
      taskToken: 'token-1',
      packageChannelId,
      verticalPackageChannelId,
      packageDomainName: 'example.com',
      verticalPackageDomainName: 'vertical.example.com',
      endpoints: [],
    });

    expect(liveChannelsManager.createdChannels).toEqual([
      expect.objectContaining({
        eventId,
        source,
        packageChannelId,
        verticalPackageChannelId,
      }),
    ]);
  });

  it('should call appendLogsToEvent, updateLiveChannelArn, updateLiveChannelId, updateLiveInputId, updateLiveWaitingInputId in order with correct values', async () => {
    const { useCase, eventsRepository, liveChannelsManager } = setupCreate();
    const eventId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:9999999';
    const liveChannelId = '9999999';
    const liveInputId = '5555555';
    const liveWaitingInputId = '6666666';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: liveInputId,
      waitingInputId: liveWaitingInputId,
    });

    await useCase.createLiveChannel({
      eventId,
      taskToken: 'token-1',
      packageChannelId: '1111111',
      packageDomainName: 'example.com',
      endpoints: [],
    });

    const event = eventsRepository.events[0];
    expect(event.logs).toEqual([
      { timestamp: expect.any(Number), type: LogType.LIVE_INPUT_CREATED },
    ]);
    expect(event.liveChannelArn).toBe(liveChannelArn);
    expect(event.liveChannelId).toBe(liveChannelId);
    expect(event.liveInputId).toBe(liveInputId);
    expect(event.liveWaitingInputId).toBe(liveWaitingInputId);
  });

  it('should send event update with EVENT_UPDATE_UPDATE action', async () => {
    const { useCase, eventsRepository, liveChannelsManager, eventUpdateSender } =
      setupCreate();
    const eventId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: 'arn:aws:medialive:us-west-2:000000000000:channel:9999999',
      channelId: '9999999',
      inputId: '5555555',
      waitingInputId: '6666666',
    });

    await useCase.createLiveChannel({
      eventId,
      taskToken: 'token-1',
      packageChannelId: '1111111',
      packageDomainName: 'example.com',
      endpoints: [],
    });

    expect(eventUpdateSender.eventUpdates).toEqual([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: expect.objectContaining({ id: eventId }),
      },
    ]);
  });

  it('should create task token with channelArn, expectedStatus CREATED, and correct output', async () => {
    const { useCase, eventsRepository, liveChannelsManager, taskTokensRepository } =
      setupCreate();
    const eventId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:9999999';
    const liveChannelId = '9999999';
    const taskToken = 'token-1';
    const packageChannelId = '1111111';
    const verticalPackageChannelId = '2222222';

    await eventsRepository.createEvent(
      EventMother.basic().withId(eventId).build()
    );
    liveChannelsManager.setCreateChannelResponse({
      channelArn: liveChannelArn,
      channelId: liveChannelId,
      inputId: '5555555',
      waitingInputId: '6666666',
    });

    await useCase.createLiveChannel({
      eventId,
      taskToken,
      packageChannelId,
      verticalPackageChannelId,
      packageDomainName: 'example.com',
      verticalPackageDomainName: 'vertical.example.com',
      endpoints: [],
    });

    expect(taskTokensRepository.taskTokens).toEqual([
      {
        channelArn: liveChannelArn,
        expectedStatus: 'CREATED',
        taskToken,
        output: {
          eventId,
          packageChannelId,
          verticalPackageChannelId,
          packageDomainName: 'example.com',
          verticalPackageDomainName: 'vertical.example.com',
          liveChannelId,
          liveChannelArn,
          endpoints: [],
        },
      },
    ]);
  });
});

describe('Preservation: deleteLiveChannel', () => {
  it('should delete channel by liveChannelId, append LIVE_CHANNEL_STOPPED log, send event update, and create task token with expectedStatus DELETED', async () => {
    const {
      useCase,
      eventsRepository,
      liveChannelsManager,
      eventUpdateSender,
      taskTokensRepository,
    } = setupDelete();
    const eventId = 'f1f2f3f4-a5b6-7890-cdef-1234567890ab';
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:7777777';
    const liveChannelId = '7777777';
    const taskToken = 'delete-token-1';

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .withLiveChannelArn(liveChannelArn)
        .withLiveChannelId(liveChannelId)
        .build()
    );

    await useCase.deleteLiveChannel({ eventId, taskToken });

    // deleteChannel called with liveChannelId
    expect(liveChannelsManager.deletedChannels).toEqual([liveChannelId]);

    // LIVE_CHANNEL_STOPPED log appended
    expect(eventsRepository.events[0].logs).toEqual([
      { timestamp: expect.any(Number), type: LogType.LIVE_CHANNEL_STOPPED },
    ]);

    // Event update sent with EVENT_UPDATE_UPDATE
    expect(eventUpdateSender.eventUpdates).toEqual([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: eventsRepository.events[0],
      },
    ]);

    // Task token created with expectedStatus DELETED
    expect(taskTokensRepository.taskTokens).toEqual([
      {
        channelArn: liveChannelArn,
        expectedStatus: 'DELETED',
        taskToken,
        output: { eventId },
      },
    ]);
  });
});

const setupCreate = () => {
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
    eventUpdateSender,
    useCase,
  };
};

const setupDelete = () => {
  reset();
  registerTestInfrastructure();
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const taskTokensRepository = inject(tokenTaskTokensRepositoryInMemory);
  const liveChannelsManager = inject(tokenLiveChannelsManagerFake);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);
  const useCase = new DeleteLiveChannelUseCaseImpl();

  return {
    eventsRepository,
    taskTokensRepository,
    liveChannelsManager,
    eventUpdateSender,
    useCase,
  };
};
