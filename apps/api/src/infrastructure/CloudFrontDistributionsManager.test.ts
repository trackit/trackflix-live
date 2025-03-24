import { mockClient } from 'aws-sdk-client-mock';
import {
  CloudFrontClient,
  CreateDistributionCommand,
  DeleteDistributionCommand,
  GetDistributionCommand,
} from '@aws-sdk/client-cloudfront';
import { CloudFrontDistributionsManager } from './CloudFrontDistributionsManager';

describe('CloudFront distributions manager', () => {
  const mock = mockClient(CloudFrontClient);

  beforeEach(() => {
    mock.reset();
  });

  describe('createDistribution', () => {
    it('should create distribution', async () => {
      const { cloudFrontDistributionsManager } = setup();
      const cdnDistributionId = 'E2QWRUHAPOMQZL';
      const domainName = 'd111111abcdef8.cloudfront.net';
      const dummyPackageDomainName = 'trackit.io';

      mock.on(CreateDistributionCommand).resolves({
        Distribution: {
          Id: cdnDistributionId,
          DomainName: domainName,
          Status: 'Deployed',
          ARN: 'arn:aws:cloudfront::123456789012:distribution/E2QWRUHAPOMQZL',
          LastModifiedTime: new Date(),
          InProgressInvalidationBatches: 0,
          DistributionConfig: undefined,
        },
      });

      const result = await cloudFrontDistributionsManager.createDistribution();

      const commandCalls = mock.commandCalls(CreateDistributionCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        DistributionConfig: {
          CallerReference: 'Trackflix-live events',
          Comment: 'Distribution for Trackflix-live events',
          Enabled: true,
          DefaultCacheBehavior: {
            TargetOriginId: 'dummy-origin',
            ViewerProtocolPolicy: 'allow-all',
            AllowedMethods: {
              Items: ['GET', 'HEAD', 'OPTIONS'],
              Quantity: 3,
              CachedMethods: {
                Items: ['GET', 'HEAD', 'OPTIONS'],
                Quantity: 3,
              },
            },
          },
          Origins: {
            Quantity: 1,
            Items: [
              {
                Id: 'dummy-origin',
                DomainName: dummyPackageDomainName,
              },
            ],
          },
        },
      });
      expect(result).toEqual({
        cdnDistributionId,
      });
    });
  });

  describe('deleteDistribution', () => {
    it('should delete distribution', async () => {
      const { cloudFrontDistributionsManager } = setup();
      const cdnDistributionId = 'E2QWRUHAPOMQZL';

      mock.on(GetDistributionCommand).resolves({
        Distribution: {
          DistributionConfig: {
            Enabled: false,
            CallerReference: 'test-ref',
            Comment: 'test comment',
            DefaultCacheBehavior: {
              TargetOriginId: 'test-origin',
              ViewerProtocolPolicy: 'redirect-to-https',
              ForwardedValues: {
                QueryString: false,
                Cookies: { Forward: 'none' },
              },
            },
            Origins: {
              Quantity: 1,
              Items: [
                {
                  Id: 'test-origin',
                  DomainName: 'test.com',
                  CustomOriginConfig: {
                    HTTPPort: 80,
                    HTTPSPort: 443,
                    OriginProtocolPolicy: 'https-only',
                  },
                },
              ],
            },
          },
          Id: cdnDistributionId,
          Status: 'Deployed',
          ARN: 'arn:aws:cloudfront::123456789012:distribution/E2QWRUHAPOMQZL',
          LastModifiedTime: new Date(),
          DomainName: 'test.cloudfront.net',
          InProgressInvalidationBatches: 0,
        },
      });

      await cloudFrontDistributionsManager.deleteDistribution(
        cdnDistributionId
      );

      const commandCalls = mock.commandCalls(DeleteDistributionCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        Id: cdnDistributionId,
      });
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
