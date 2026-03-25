/**
 * Bug Condition Exploration Test
 *
 * These tests encode the EXPECTED (correct) behavior for the smart crop integration.
 * They are EXPECTED TO FAIL on unfixed code — failure confirms the bug exists.
 *
 * Bug: createLiveChannel calls setupRealtimeCropping AFTER channel creation,
 * instead of calling createFeed BEFORE channel creation and passing feedArn.
 * Additionally, feedId is never persisted and feeds are never cleaned up on delete.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
import { CreateLiveChannelUseCaseImpl } from './createLiveChannel';
import { DeleteLiveChannelUseCaseImpl } from '../deleteLiveChannel/deleteLiveChannel';
import {
  registerTestInfrastructure,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenLiveChannelsManagerFake,
  tokenElementalInferenceManagerFake,
  tokenTaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { EventMother } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';

describe('Bug Condition Exploration: Smart Crop Integration', () => {
  describe('createLiveChannel - feed creation ordering and parameters', () => {
    it('should call createFeed(eventId) BEFORE createChannel and return { feedArn, feedId }', async () => {
      /**
       * Validates: Requirements 1.1, 1.2
       *
       * Expected behavior: elementalInferenceManager.createFeed(eventId) is called
       * BEFORE liveChannelsManager.createChannel(), and returns { feedArn, feedId }.
       *
       * Current bug: setupRealtimeCropping is called AFTER createChannel.
       * The elementalInferenceManager doesn't even have a createFeed method.
       */
      const {
        elementalInferenceManager,
        liveChannelsManager,
        eventsRepository,
        useCase,
      } = setupCreate();
      const eventId = 'evt-bug-test-001';
      const source = 's3://test-bucket/test-video.mp4';

      await eventsRepository.createEvent(
        EventMother.basic().withId(eventId).withSource(source).build()
      );
      liveChannelsManager.setCreateChannelResponse({
        channelArn: 'arn:aws:medialive:us-west-2:000000000000:channel:1111',
        channelId: '1111',
        inputId: '2222',
        waitingInputId: '3333',
      });

      // Track call order using spies
      const callOrder: string[] = [];
      const originalCreateChannel =
        liveChannelsManager.createChannel.bind(liveChannelsManager);

      jest
        .spyOn(liveChannelsManager, 'createChannel')
        .mockImplementation(async (params) => {
          callOrder.push('createChannel');
          return originalCreateChannel(params);
        });

      // The expected behavior requires createFeed to exist on the manager.
      // On unfixed code, only setupRealtimeCropping exists.
      // We check if createFeed exists as a method — it won't on unfixed code.
      const managerAsAny = elementalInferenceManager as any;
      expect(typeof managerAsAny.createFeed).toBe('function');

      if (typeof managerAsAny.createFeed === 'function') {
        jest.spyOn(managerAsAny, 'createFeed').mockImplementation(async () => {
          callOrder.push('createFeed');
          return { feedArn: 'mock-feed-arn', feedId: 'mock-feed-id' };
        });
      }

      await useCase.createLiveChannel({
        eventId,
        taskToken: 'test-token',
        packageChannelId: 'pkg-001',
        packageDomainName: 'example.com',
        endpoints: [],
      });

      // Expected: createFeed is called before createChannel
      expect(callOrder).toEqual(['createFeed', 'createChannel']);
    });

    it('should pass feedArn to liveChannelsManager.createChannel()', async () => {
      /**
       * Validates: Requirements 1.4
       *
       * Expected behavior: createChannel receives feedArn in its parameters.
       *
       * Current bug: CreateChannelParameters has no feedArn field,
       * and createChannel is called without any feed reference.
       */
      const { liveChannelsManager, eventsRepository, useCase } = setupCreate();
      const eventId = 'evt-bug-test-002';
      const source = 's3://test-bucket/test-video.mp4';

      await eventsRepository.createEvent(
        EventMother.basic().withId(eventId).withSource(source).build()
      );
      liveChannelsManager.setCreateChannelResponse({
        channelArn: 'arn:aws:medialive:us-west-2:000000000000:channel:1111',
        channelId: '1111',
        inputId: '2222',
        waitingInputId: '3333',
      });

      await useCase.createLiveChannel({
        eventId,
        taskToken: 'test-token',
        packageChannelId: 'pkg-001',
        packageDomainName: 'example.com',
        endpoints: [],
      });

      // Expected: createChannel was called with feedArn in its parameters
      const channelParams = liveChannelsManager.createdChannels[0] as any;
      expect(channelParams).toHaveProperty('feedArn');
      expect(channelParams.feedArn).toBeDefined();
    });

    it('should call eventsRepository.updateFeedId(eventId, feedId) to persist the feed ID', async () => {
      /**
       * Validates: Requirements 1.6
       *
       * Expected behavior: After creating the feed and channel,
       * eventsRepository.updateFeedId(eventId, feedId) is called.
       *
       * Current bug: No updateFeedId method exists, feedId is never persisted.
       */
      const { eventsRepository, liveChannelsManager, useCase } = setupCreate();
      const eventId = 'evt-bug-test-003';
      const source = 's3://test-bucket/test-video.mp4';

      await eventsRepository.createEvent(
        EventMother.basic().withId(eventId).withSource(source).build()
      );
      liveChannelsManager.setCreateChannelResponse({
        channelArn: 'arn:aws:medialive:us-west-2:000000000000:channel:1111',
        channelId: '1111',
        inputId: '2222',
        waitingInputId: '3333',
      });

      // Spy on updateFeedId — this method doesn't exist yet on the repository
      const updateFeedIdSpy = jest.fn();
      (eventsRepository as any).updateFeedId = updateFeedIdSpy;

      await useCase.createLiveChannel({
        eventId,
        taskToken: 'test-token',
        packageChannelId: 'pkg-001',
        packageDomainName: 'example.com',
        endpoints: [],
      });

      // Expected: updateFeedId was called with the eventId and a feedId
      expect(updateFeedIdSpy).toHaveBeenCalledWith(eventId, expect.any(String));
    });

    it('should propagate createFeed errors and never call createChannel', async () => {
      /**
       * Validates: Requirements 1.3
       *
       * Expected behavior: When createFeed throws, the error propagates
       * and createChannel is never called.
       *
       * Current bug: setupRealtimeCropping is called AFTER createChannel,
       * and errors are silently swallowed. The channel is created regardless.
       */
      const {
        elementalInferenceManager,
        liveChannelsManager,
        eventsRepository,
        useCase,
      } = setupCreate();
      const eventId = 'evt-bug-test-004';
      const source = 's3://test-bucket/test-video.mp4';

      await eventsRepository.createEvent(
        EventMother.basic().withId(eventId).withSource(source).build()
      );
      liveChannelsManager.setCreateChannelResponse({
        channelArn: 'arn:aws:medialive:us-west-2:000000000000:channel:1111',
        channelId: '1111',
        inputId: '2222',
        waitingInputId: '3333',
      });

      // Make the inference manager's feed creation fail.
      const feedError = new Error(
        'ServiceQuotaExceededException: Feed limit reached'
      );

      // Override createFeed to throw (simulating feed creation failure)
      // On fixed code, createFeed exists and errors should propagate
      jest
        .spyOn(elementalInferenceManager, 'createFeed')
        .mockRejectedValue(feedError);

      // Expected: createLiveChannel should throw when feed creation fails
      await expect(
        useCase.createLiveChannel({
          eventId,
          taskToken: 'test-token',
          packageChannelId: 'pkg-001',
          packageDomainName: 'example.com',
          endpoints: [],
        })
      ).rejects.toThrow('ServiceQuotaExceededException');

      // Expected: createChannel should NOT have been called
      expect(liveChannelsManager.createdChannels).toHaveLength(0);
    });
  });

  describe('deleteLiveChannel - feed cleanup', () => {
    it('should call elementalInferenceManager.deleteFeed(feedId) when feedId exists on the event', async () => {
      /**
       * Validates: Requirements 1.5
       *
       * Expected behavior: When deleting a live channel, if the event has a feedId,
       * elementalInferenceManager.deleteFeed(event.feedId) is called.
       *
       * Current bug: deleteLiveChannel does not inject elementalInferenceManager
       * and never calls deleteFeed. Feeds are orphaned.
       */
      const { elementalInferenceManager, eventsRepository, useCase } =
        setupDelete();
      const eventId = 'evt-bug-test-005';
      const liveChannelArn =
        'arn:aws:medialive:us-west-2:000000000000:channel:1111';
      const liveChannelId = '1111';
      const feedId = 'feed-abc-123';

      const event = EventMother.basic()
        .withId(eventId)
        .withLiveChannelArn(liveChannelArn)
        .withLiveChannelId(liveChannelId)
        .build();
      // Manually set feedId since the Event type doesn't have it yet
      (event as any).feedId = feedId;
      await eventsRepository.createEvent(event);

      // Track deleteFeed calls — method doesn't exist on unfixed fake
      const deleteFeedSpy = jest.fn();
      (elementalInferenceManager as any).deleteFeed = deleteFeedSpy;

      await useCase.deleteLiveChannel({
        eventId,
        taskToken: 'test-token',
      });

      // Expected: deleteFeed was called with the event's feedId
      expect(deleteFeedSpy).toHaveBeenCalledWith(feedId);
    });
  });
});

const setupCreate = () => {
  reset();
  registerTestInfrastructure();
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const taskTokensRepository = inject(tokenTaskTokensRepositoryInMemory);
  const liveChannelsManager = inject(tokenLiveChannelsManagerFake);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);
  const elementalInferenceManager = inject(tokenElementalInferenceManagerFake);

  const useCase = new CreateLiveChannelUseCaseImpl();

  return {
    eventsRepository,
    taskTokensRepository,
    liveChannelsManager,
    useCase,
    eventUpdateSender,
    elementalInferenceManager,
  };
};

const setupDelete = () => {
  reset();
  registerTestInfrastructure();
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const taskTokensRepository = inject(tokenTaskTokensRepositoryInMemory);
  const liveChannelsManager = inject(tokenLiveChannelsManagerFake);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);
  const elementalInferenceManager = inject(tokenElementalInferenceManagerFake);

  const useCase = new DeleteLiveChannelUseCaseImpl();

  return {
    eventsRepository,
    taskTokensRepository,
    liveChannelsManager,
    useCase,
    eventUpdateSender,
    elementalInferenceManager,
  };
};
