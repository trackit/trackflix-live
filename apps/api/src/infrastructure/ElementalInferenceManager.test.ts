import { mockClient } from 'aws-sdk-client-mock';
import {
  ElementalInferenceClient,
  CreateFeedCommand,
  AssociateFeedCommand,
  ListFeedsCommand,
  DeleteFeedCommand,
  FeedStatus,
} from '@aws-sdk/client-elementalinference';
import { ElementalInferenceManager } from './ElementalInferenceManager';

describe('ElementalInference manager', () => {
  const mock = mockClient(ElementalInferenceClient);

  beforeEach(() => {
    mock.reset();
  });

  describe('setupRealtimeCropping', () => {
    it('should cleanup existing feeds before creating a new one', async () => {
      const { elementalInferenceManager } = setup();
      const channelArn = 'arn:aws:medialive:us-west-2:000000000000:channel:12345';
      
      mock.on(ListFeedsCommand).resolves({
        feeds: [
          { id: 'feed-1', arn: 'arn-1', name: 'name-1', status: FeedStatus.ACTIVE },
          { id: 'feed-2', arn: 'arn-2', name: 'name-2', status: FeedStatus.ACTIVE },
        ],
      });
      mock.on(DeleteFeedCommand).resolves({});
      mock.on(CreateFeedCommand).resolves({ id: 'new-feed-id' });
      mock.on(AssociateFeedCommand).resolves({});

      await elementalInferenceManager.setupRealtimeCropping(channelArn);

      expect(mock.commandCalls(ListFeedsCommand)).toHaveLength(1);
      expect(mock.commandCalls(DeleteFeedCommand)).toHaveLength(2);
      expect(mock.commandCalls(DeleteFeedCommand)[0].args[0].input).toEqual({ id: 'feed-1' });
      expect(mock.commandCalls(DeleteFeedCommand)[1].args[0].input).toEqual({ id: 'feed-2' });
    });

    it('should create and associate feed with MediaLive channel ID', async () => {
      const { elementalInferenceManager } = setup();
      const channelArn = 'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
      const feedId = 'new-feed-id';
      
      mock.on(ListFeedsCommand).resolves({ feeds: [] });
      mock.on(CreateFeedCommand).resolves({ id: feedId });
      mock.on(AssociateFeedCommand).resolves({});

      await elementalInferenceManager.setupRealtimeCropping(channelArn);

      const createFeedCalls = mock.commandCalls(CreateFeedCommand);
      expect(createFeedCalls).toHaveLength(1);
      expect(createFeedCalls[0].args[0].input).toMatchObject({
        name: expect.stringMatching(/^CroppingFeed-.*/),
        outputs: [],
      });

      const associateFeedCalls = mock.commandCalls(AssociateFeedCommand);
      expect(associateFeedCalls).toHaveLength(1);
      expect(associateFeedCalls[0].args[0].input).toEqual({
        id: feedId,
        associatedResourceName: '8626488',
        outputs: [
          {
            name: 'CroppingOutput',
            status: 'ENABLED',
            outputConfig: {
              cropping: {},
            },
          },
        ],
      });
    });

    it('should handle errors gracefully without rethrowing', async () => {
      const { elementalInferenceManager } = setup();
      const channelArn = 'arn:aws:medialive:us-west-2:000000000000:channel:12345';
      
      mock.on(ListFeedsCommand).rejects(new Error('AWS Error'));

      await expect(elementalInferenceManager.setupRealtimeCropping(channelArn)).resolves.not.toThrow();
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
  });

  return { client, elementalInferenceManager };
};
