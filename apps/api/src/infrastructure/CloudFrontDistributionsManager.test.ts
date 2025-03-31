import { mockClient } from 'aws-sdk-client-mock';
import {
  CloudFrontClient,
  GetDistributionCommand,
  GetDistributionResult,
  UpdateDistributionCommand,
} from '@aws-sdk/client-cloudfront';
import { CloudFrontDistributionsManager } from './CloudFrontDistributionsManager';

describe('CloudFront distributions manager', () => {
  const mock = mockClient(CloudFrontClient);

  beforeEach(() => {
    mock.reset();
  });

  const mockDistribution: GetDistributionResult = {
    Distribution: {
      Id: process.env.DISTRIBUTION_ID,
      ARN: 'test-arn',
      Status: 'Deployed',
      LastModifiedTime: new Date(),
      InProgressInvalidationBatches: 0,
      DomainName: 'test.cloudfront.net',
      DistributionConfig: {
        CallerReference: 'test-ref',
        Comment: 'test-comment',
        Enabled: true,
        Origins: {
          Items: [
            {
              Id: 'existing-origin',
              DomainName: 'existing-domain.com',
              CustomHeaders: { Items: [], Quantity: 0 },
              CustomOriginConfig: {
                OriginProtocolPolicy: 'https-only',
                HTTPPort: 80,
                HTTPSPort: 443,
                OriginSslProtocols: { Items: ['TLSv1.2'], Quantity: 1 },
              },
              ConnectionAttempts: 3,
              ConnectionTimeout: 10,
              OriginShield: { Enabled: false },
              OriginAccessControlId: 'access-control-id',
            },
          ],
          Quantity: 1,
        },
        CacheBehaviors: {
          Items: [],
          Quantity: 0,
        },
        DefaultCacheBehavior: {
          TargetOriginId: 'default-origin',
          ViewerProtocolPolicy: 'redirect-to-https',
          CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
          SmoothStreaming: false,
          Compress: true,
          AllowedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
            CachedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD'],
            },
          },
        },
      },
    },
    ETag: 'test-etag',
  };

  describe('getDistribution', () => {
    it('should get distribution', async () => {
      const { cloudFrontDistributionsManager } = setup();
      const distributionId = 'test-distribution-id';

      mock.on(GetDistributionCommand).resolves(mockDistribution);

      const result = await cloudFrontDistributionsManager.getDistribution(
        distributionId
      );

      expect(result).toEqual({
        distribution: mockDistribution.Distribution,
        eTag: mockDistribution.ETag,
      });
    });

    it('should throw if distribution not found', async () => {
      const { cloudFrontDistributionsManager } = setup();
      const distributionId = 'test-distribution-id';

      mock.on(GetDistributionCommand).resolves({});

      await expect(
        cloudFrontDistributionsManager.getDistribution(distributionId)
      ).rejects.toThrow('Failed to get CloudFront distribution');
    });
  });

  describe('createOrigin', () => {
    it('should create origin', async () => {
      const { cloudFrontDistributionsManager } = setup();
      process.env.DISTRIBUTION_ID = 'test-distribution-id';
      const eventId = 'test-event-id';
      const packageDomainName = 'test-domain-name';

      mock.on(GetDistributionCommand).resolves(mockDistribution);
      mock.on(UpdateDistributionCommand).resolves({});

      await cloudFrontDistributionsManager.createOrigin({
        eventId,
        liveChannelArn: 'test-live-channel-arn',
        liveChannelId: 'test-live-channel-id',
        packageChannelId: 'test-package-channel-id',
        packageDomainName,
      });

      expect(mock.calls()).toHaveLength(2);
    });

    it('should throw if DISTRIBUTION_ID not set', async () => {
      const { cloudFrontDistributionsManager } = setup();
      process.env.DISTRIBUTION_ID = '';

      await expect(
        cloudFrontDistributionsManager.createOrigin({
          eventId: 'id',
          liveChannelArn: 'test-live-channel-arn',
          liveChannelId: 'test-live-channel-id',
          packageChannelId: 'test-package-channel-id',
          packageDomainName: 'domain',
        })
      ).rejects.toThrow('DISTRIBUTION_ID environment variable is not set');
    });
  });
});

const setup = () => {
  const client = new CloudFrontClient({
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
  const cloudFrontDistributionsManager = new CloudFrontDistributionsManager({
    client,
  });

  return { client, cloudFrontDistributionsManager };
};
