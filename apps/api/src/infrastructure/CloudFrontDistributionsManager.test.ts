import { mockClient } from 'aws-sdk-client-mock';
import {
  CloudFrontClient,
  Distribution,
  GetDistributionCommand,
  GetDistributionCommandOutput,
  GetDistributionResult,
  UpdateDistributionCommand,
  UpdateDistributionCommandInput,
} from '@aws-sdk/client-cloudfront';
import { CloudFrontDistributionsManager } from './CloudFrontDistributionsManager';
import { EndpointType, EventEndpoint } from '@trackflix-live/types';

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
      const cdnDistributionId = 'test-distribution-id';
      const endpoints: EventEndpoint[] = [
        { url: 'https://amazonaws.com/hls/index.m3u8', type: EndpointType.HLS },
        {
          url: 'https://amazonaws.com/dash/index.mpd',
          type: EndpointType.DASH,
        },
      ];

      mock.on(GetDistributionCommand).resolves(mockDistribution);
      mock.on(UpdateDistributionCommand).resolves({});

      const result = await cloudFrontDistributionsManager.createOrigin({
        eventId,
        packageDomainName,
        endpoints,
        cdnDistributionId,
      });

      const getDistributionCall = mock
        .calls()
        .find((call) => call.args[0] instanceof GetDistributionCommand);
      expect(getDistributionCall).toBeDefined();
      expect(getDistributionCall?.args[0].input).toEqual({
        Id: cdnDistributionId,
      });

      const updateCall = mock
        .calls()
        .find((call) => call.args[0] instanceof UpdateDistributionCommand);
      expect(updateCall).toBeDefined();
      const updateInput = updateCall?.args[0]
        .input as UpdateDistributionCommandInput;
      expect(updateInput.Id).toBe(cdnDistributionId);
      expect(updateInput.IfMatch).toBe('test-etag');

      const config = updateInput.DistributionConfig;

      const origin = config?.Origins?.Items?.find((o) => o.Id === eventId);
      expect(origin).toBeDefined();
      expect(origin?.DomainName).toBe(packageDomainName);

      const cacheBehaviors = config?.CacheBehaviors?.Items?.filter(
        (b) => b.TargetOriginId === eventId
      );
      expect(cacheBehaviors).toHaveLength(2);
      expect(cacheBehaviors?.[0]?.PathPattern).toContain('/hls/*');
      expect(cacheBehaviors?.[1]?.PathPattern).toContain('/dash/*');

      expect(result).toEqual({
        eventId,
        endpoints: [
          {
            url: `https://${mockDistribution.Distribution?.DomainName}/hls/index.m3u8`,
            type: EndpointType.HLS,
          },
          {
            url: `https://${mockDistribution.Distribution?.DomainName}/dash/index.mpd`,
            type: EndpointType.DASH,
          },
        ],
      });
    });
  });

  describe('deleteOrigin', () => {
    it('should delete origin and associated cache behaviors', async () => {
      const { cloudFrontDistributionsManager } = setup();
      const eventId = 'test-event-id';
      const cdnDistributionId = 'test-distribution-id';

      const distributionUpdated: Distribution = {
        ...mockDistribution.Distribution,
        Id: cdnDistributionId,
        ARN: 'test-arn',
        Status: 'Deployed',
        LastModifiedTime: new Date(),
        InProgressInvalidationBatches: 0,
        DomainName: 'test.cloudfront.net',
        DistributionConfig: {
          CallerReference: 'test-ref',
          Comment: 'test-comment',
          Enabled: true,
          DefaultCacheBehavior: mockDistribution.Distribution
            ?.DistributionConfig?.DefaultCacheBehavior ?? {
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
          Origins: {
            Items: [
              {
                Id: 'existing-origin',
                DomainName: 'existing-domain.com',
                CustomHeaders: { Items: [], Quantity: 0 },
                CustomOriginConfig: {
                  OriginProtocolPolicy: 'https-only' as const,
                  HTTPPort: 80,
                  HTTPSPort: 443,
                  OriginSslProtocols: {
                    Items: ['TLSv1.2' as const],
                    Quantity: 1,
                  },
                },
                ConnectionAttempts: 3,
                ConnectionTimeout: 10,
                OriginShield: { Enabled: false },
                OriginAccessControlId: 'access-control-id',
              },
              {
                Id: eventId,
                DomainName: 'event-domain.com',
                CustomHeaders: { Items: [], Quantity: 0 },
                CustomOriginConfig: {
                  OriginProtocolPolicy: 'https-only' as const,
                  HTTPPort: 80,
                  HTTPSPort: 443,
                  OriginSslProtocols: {
                    Items: ['TLSv1.2' as const],
                    Quantity: 1,
                  },
                },
              },
            ],
            Quantity: 2,
          },
          CacheBehaviors: {
            Items: [
              {
                PathPattern: '/hls/*',
                TargetOriginId: eventId,
                ViewerProtocolPolicy: 'redirect-to-https' as const,
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
              {
                PathPattern: '/dash/*',
                TargetOriginId: eventId,
                ViewerProtocolPolicy: 'redirect-to-https' as const,
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
            ],
            Quantity: 2,
          },
        },
      };
      const distributionOutputUpdated: GetDistributionCommandOutput = {
        Distribution: distributionUpdated,
        ETag: 'test-etag',
        $metadata: {},
      };

      mock.on(GetDistributionCommand).resolves(distributionOutputUpdated);
      mock.on(UpdateDistributionCommand).resolves({});

      await cloudFrontDistributionsManager.deleteOrigin({
        eventId,
        cdnDistributionId,
      });

      const getDistributionCall = mock
        .calls()
        .find((call) => call.args[0] instanceof GetDistributionCommand);
      expect(getDistributionCall).toBeDefined();
      expect(getDistributionCall?.args[0].input).toEqual({
        Id: cdnDistributionId,
      });

      const updateCall = mock
        .calls()
        .find((call) => call.args[0] instanceof UpdateDistributionCommand);
      expect(updateCall).toBeDefined();
      const updateInput = updateCall?.args[0]
        .input as UpdateDistributionCommandInput;
      expect(updateInput.Id).toBe(cdnDistributionId);
      expect(updateInput.IfMatch).toBe('test-etag');

      const config = updateInput.DistributionConfig;

      const origin = config?.Origins?.Items?.find((o) => o.Id === eventId);
      expect(origin).toBeUndefined();
      expect(config?.Origins?.Items?.length).toBe(1);
      expect(config?.Origins?.Quantity).toBe(1);

      const cacheBehaviors = config?.CacheBehaviors?.Items?.filter(
        (b) => b.TargetOriginId === eventId
      );
      expect(cacheBehaviors).toHaveLength(0);
      expect(config?.CacheBehaviors?.Items?.length).toBe(0);
      expect(config?.CacheBehaviors?.Quantity).toBe(0);
    });

    it('should not fail if origin does not exist', async () => {
      const { cloudFrontDistributionsManager } = setup();
      const eventId = 'non-existent-event-id';
      const cdnDistributionId = 'test-distribution-id';

      mock.on(GetDistributionCommand).resolves(mockDistribution);
      mock.on(UpdateDistributionCommand).resolves({});

      await cloudFrontDistributionsManager.deleteOrigin({
        eventId,
        cdnDistributionId,
      });

      const getDistributionCall = mock
        .calls()
        .find((call) => call.args[0] instanceof GetDistributionCommand);
      expect(getDistributionCall).toBeDefined();

      const updateCall = mock
        .calls()
        .find((call) => call.args[0] instanceof UpdateDistributionCommand);
      expect(updateCall).toBeDefined();

      const updateInput = updateCall?.args[0]
        .input as UpdateDistributionCommandInput;
      expect(updateInput.DistributionConfig).toEqual(
        mockDistribution.Distribution?.DistributionConfig
      );
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
