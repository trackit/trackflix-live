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

  const getMockDistribution = (
    distributionId: string
  ): GetDistributionResult => {
    return {
      Distribution: {
        Id: distributionId,
        ARN: 'test-arn',
        Status: 'Deployed',
        LastModifiedTime: new Date('2023-01-01T00:00:00Z'),
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
  };

  describe('getDistribution', () => {
    it('should get distribution', async () => {
      const { cloudFrontDistributionsManager, distributionId } = setup();

      mock
        .on(GetDistributionCommand)
        .resolves(getMockDistribution(distributionId));

      const result = await cloudFrontDistributionsManager.getDistribution();

      expect(result).toEqual({
        distribution: getMockDistribution(distributionId).Distribution,
        eTag: getMockDistribution(distributionId).ETag,
      });
    });

    it('should throw if distribution not found', async () => {
      const { cloudFrontDistributionsManager } = setup();

      mock.on(GetDistributionCommand).resolves({});

      await expect(
        cloudFrontDistributionsManager.getDistribution()
      ).rejects.toThrow('Failed to get CloudFront distribution');
    });
  });

  describe('createOrigin', () => {
    it('should create origin', async () => {
      const { cloudFrontDistributionsManager, distributionId } = setup();
      const eventId = 'test-event-id';
      const packageDomainName = 'test-domain-name';
      const endpoints: EventEndpoint[] = [
        { url: 'https://amazonaws.com/hls/index.m3u8', type: EndpointType.HLS },
        {
          url: 'https://amazonaws.com/dash/index.mpd',
          type: EndpointType.DASH,
        },
      ];

      mock
        .on(GetDistributionCommand)
        .resolves(getMockDistribution(distributionId));
      mock.on(UpdateDistributionCommand).resolves({});

      const result = await cloudFrontDistributionsManager.createOrigin({
        eventId,
        packageDomainName,
        endpoints,
      });

      const getDistributionCall = mock
        .calls()
        .find((call) => call.args[0] instanceof GetDistributionCommand);
      expect(getDistributionCall).toBeDefined();
      expect(getDistributionCall?.args[0].input).toEqual({
        Id: distributionId,
      });

      const updateCall = mock
        .calls()
        .find((call) => call.args[0] instanceof UpdateDistributionCommand);
      expect(updateCall).toBeDefined();
      const updateInput = updateCall?.args[0]
        .input as UpdateDistributionCommandInput;
      expect(updateInput.Id).toBe(distributionId);
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

      const distributionDomainName =
        getMockDistribution(distributionId).Distribution?.DomainName;
      expect(result).toEqual({
        eventId,
        endpoints: [
          {
            url: `https://${distributionDomainName}/hls/index.m3u8`,
            type: EndpointType.HLS,
          },
          {
            url: `https://${distributionDomainName}/dash/index.mpd`,
            type: EndpointType.DASH,
          },
        ],
      });
    });
  });

  describe('deleteOrigin', () => {
    it('should delete origin and associated cache behaviors', async () => {
      const { cloudFrontDistributionsManager, distributionId } = setup();
      const eventId = 'test-event-id';

      const distributionUpdated: Distribution = {
        ...getMockDistribution(distributionId).Distribution,
        Id: distributionId,
        ARN: 'test-arn',
        Status: 'Deployed',
        LastModifiedTime: new Date('2023-01-01T00:00:00Z'),
        InProgressInvalidationBatches: 0,
        DomainName: 'test.cloudfront.net',
        DistributionConfig: {
          CallerReference: 'test-ref',
          Comment: 'test-comment',
          Enabled: true,
          DefaultCacheBehavior: getMockDistribution(distributionId).Distribution
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
      });

      const getDistributionCall = mock
        .calls()
        .find((call) => call.args[0] instanceof GetDistributionCommand);
      expect(getDistributionCall).toBeDefined();
      expect(getDistributionCall?.args[0].input).toEqual({
        Id: distributionId,
      });

      const updateCall = mock
        .calls()
        .find((call) => call.args[0] instanceof UpdateDistributionCommand);
      expect(updateCall).toBeDefined();
      const updateInput = updateCall?.args[0]
        .input as UpdateDistributionCommandInput;
      expect(updateInput.Id).toBe(distributionId);
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
      const { cloudFrontDistributionsManager, distributionId } = setup();
      const eventId = 'non-existent-event-id';

      mock
        .on(GetDistributionCommand)
        .resolves(getMockDistribution(distributionId));
      mock.on(UpdateDistributionCommand).resolves({});

      await cloudFrontDistributionsManager.deleteOrigin({
        eventId,
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
        getMockDistribution(distributionId).Distribution?.DistributionConfig
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
  const distributionId = 'test-distribution-id';
  const cloudFrontDistributionsManager = new CloudFrontDistributionsManager({
    client,
    cdnDistributionId: distributionId,
  });

  return { client, cloudFrontDistributionsManager, distributionId };
};
