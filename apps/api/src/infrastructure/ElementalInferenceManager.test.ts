import { mockClient } from 'aws-sdk-client-mock';
import {
  ElementalInferenceClient,
  CreateFeedCommand,
  DeleteFeedCommand,
  DisassociateFeedCommand,
  GetFeedCommand,
} from '@aws-sdk/client-elementalinference';
import { ElementalInferenceManager } from './ElementalInferenceManager';

describe('ElementalInference manager', () => {
  const mock = mockClient(ElementalInferenceClient);

  beforeEach(() => {
    mock.reset();
  });

  describe('createFeed', () => {
    it('should create a feed with empty outputs and return feedArn and feedId', async () => {
      const { elementalInferenceManager } = setup();
      const eventId = 'evt-123';

      mock.on(CreateFeedCommand).resolves({
        arn: 'arn:aws:elementalinference:us-west-2:000000000000:feed/new-feed',
        id: 'new-feed-id',
      });
      mock.on(GetFeedCommand).resolves({ status: 'AVAILABLE' });

      const result = await elementalInferenceManager.createFeed(eventId);

      expect(result).toEqual({
        feedArn:
          'arn:aws:elementalinference:us-west-2:000000000000:feed/new-feed',
        feedId: 'new-feed-id',
      });

      const createFeedCalls = mock.commandCalls(CreateFeedCommand);
      expect(createFeedCalls).toHaveLength(1);
      expect(createFeedCalls[0].args[0].input).toEqual({
        name: 'CroppingFeed-evt-123',
        outputs: [],
      });
    });

    it('should throw when CreateFeedCommand returns incomplete response', async () => {
      const { elementalInferenceManager } = setup();

      mock.on(CreateFeedCommand).resolves({});

      await expect(
        elementalInferenceManager.createFeed('evt-456')
      ).rejects.toThrow(
        'CreateFeedCommand returned incomplete response for event evt-456'
      );
    });

    it('should let SDK errors propagate', async () => {
      const { elementalInferenceManager } = setup();

      mock.on(CreateFeedCommand).rejects(new Error('ServiceQuotaExceeded'));

      await expect(
        elementalInferenceManager.createFeed('evt-789')
      ).rejects.toThrow('ServiceQuotaExceeded');
    });
  });

  describe('deleteFeed', () => {
    it('should call DisassociateFeedCommand then DeleteFeedCommand with the given feedId', async () => {
      const { elementalInferenceManager } = setup();

      mock.on(DisassociateFeedCommand).resolves({});
      mock.on(GetFeedCommand).resolves({ status: 'ARCHIVED' });
      mock.on(DeleteFeedCommand).resolves({});

      await elementalInferenceManager.deleteFeed('feed-to-delete');

      const disassociateCalls = mock.commandCalls(DisassociateFeedCommand);
      expect(disassociateCalls).toHaveLength(1);
      expect(disassociateCalls[0].args[0].input).toEqual({
        id: 'feed-to-delete',
      });

      const deleteFeedCalls = mock.commandCalls(DeleteFeedCommand);
      expect(deleteFeedCalls).toHaveLength(1);
      expect(deleteFeedCalls[0].args[0].input).toEqual({
        id: 'feed-to-delete',
      });
    });

    it('should let SDK errors propagate', async () => {
      const { elementalInferenceManager } = setup();

      mock.on(DisassociateFeedCommand).rejects(new Error('FeedNotFound'));

      await expect(
        elementalInferenceManager.deleteFeed('nonexistent-feed')
      ).rejects.toThrow('FeedNotFound');
    });
  });

  describe('waitForFeedStatus (via createFeed)', () => {
    it('should poll with exponential backoff until status matches', async () => {
      const { elementalInferenceManager } = setup();

      mock.on(CreateFeedCommand).resolves({
        arn: 'arn:aws:elementalinference:us-east-1:000000000000:feed/f1',
        id: 'f1',
      });
      mock
        .on(GetFeedCommand)
        .resolvesOnce({ status: 'CREATING' })
        .resolvesOnce({ status: 'CREATING' })
        .resolvesOnce({ status: 'AVAILABLE' });

      const result = await elementalInferenceManager.createFeed('evt-poll');

      expect(result.feedId).toBe('f1');
      expect(mock.commandCalls(GetFeedCommand)).toHaveLength(3);
    });

    it('should throw after max attempts if status never matches', async () => {
      const { elementalInferenceManager } = setup();

      mock.on(CreateFeedCommand).resolves({
        arn: 'arn:aws:elementalinference:us-east-1:000000000000:feed/f2',
        id: 'f2',
      });
      mock.on(GetFeedCommand).resolves({ status: 'CREATING' });

      await expect(
        elementalInferenceManager.createFeed('evt-timeout')
      ).rejects.toThrow('Feed f2 did not reach AVAILABLE within');
    });
  });

  describe('waitForFeedStatus (via deleteFeed)', () => {
    it('should poll until ARCHIVED before deleting', async () => {
      const { elementalInferenceManager } = setup();

      mock.on(DisassociateFeedCommand).resolves({});
      mock
        .on(GetFeedCommand)
        .resolvesOnce({ status: 'ACTIVE' })
        .resolvesOnce({ status: 'ARCHIVED' });
      mock.on(DeleteFeedCommand).resolves({});

      await elementalInferenceManager.deleteFeed('feed-poll');

      expect(mock.commandCalls(GetFeedCommand)).toHaveLength(2);
      expect(mock.commandCalls(DeleteFeedCommand)).toHaveLength(1);
    });
  });
});

const setup = () => {
  const client = new ElementalInferenceClient({
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });

  const elementalInferenceManager = new ElementalInferenceManager({
    client,
    timeoutMs: 50,
    initialDelayMs: 1,
  });

  return { elementalInferenceManager };
};
