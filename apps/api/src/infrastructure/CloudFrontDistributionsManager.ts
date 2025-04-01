import {
  CDNDistributionsManager,
  CreateCDNOriginParameters,
  CreateCDNOriginResponse,
} from '@trackflix-live/api-events';
import {
  CloudFrontClient,
  Distribution,
  GetDistributionCommand,
  UpdateDistributionCommand,
} from '@aws-sdk/client-cloudfront';
import { EndpointType } from '@trackflix-live/types';

export class CloudFrontDistributionsManager implements CDNDistributionsManager {
  private readonly client: CloudFrontClient;

  public constructor({ client }: { client: CloudFrontClient }) {
    this.client = client;
  }

  public async getDistribution(
    cdnDistributionId: string
  ): Promise<{ distribution: Distribution; eTag: string }> {
    const response = await this.client.send(
      new GetDistributionCommand({
        Id: cdnDistributionId,
      })
    );
    if (!response.Distribution) {
      throw new Error('Failed to get CloudFront distribution');
    }

    return { distribution: response.Distribution, eTag: response.ETag ?? '' };
  }

  public async createOrigin({
    eventId,
    liveChannelArn,
    liveChannelId,
    packageChannelId,
    packageDomainName,
    endpoints,
  }: CreateCDNOriginParameters): Promise<CreateCDNOriginResponse> {
    const distributionId = process.env.DISTRIBUTION_ID;
    if (!distributionId) {
      throw new Error('DISTRIBUTION_ID environment variable is not set');
    }
    const distributionData = await this.getDistribution(distributionId);

    if (!distributionData.distribution.DistributionConfig) {
      throw new Error('Distribution has no config');
    }

    if (!distributionData.distribution.DistributionConfig.Origins) {
      distributionData.distribution.DistributionConfig.Origins = {
        Quantity: 0,
        Items: [],
      };
    }

    distributionData.distribution.DistributionConfig.Origins.Items?.push({
      Id: eventId,
      DomainName: packageDomainName,
      CustomHeaders: { Quantity: 0 },
      OriginPath: '',
      CustomOriginConfig: {
        HTTPPort: 80,
        HTTPSPort: 443,
        OriginProtocolPolicy: 'match-viewer',
        OriginSslProtocols: { Quantity: 2, Items: ['SSLv3', 'TLSv1'] },
        OriginReadTimeout: 30,
        OriginKeepaliveTimeout: 5,
      },
      ConnectionAttempts: 3,
      ConnectionTimeout: 10,
      OriginShield: { Enabled: false },
      OriginAccessControlId: '',
    });
    distributionData.distribution.DistributionConfig.Origins.Quantity =
      distributionData.distribution.DistributionConfig.Origins.Items?.length ??
      0;

    if (
      !distributionData.distribution.DistributionConfig.CacheBehaviors ||
      !distributionData.distribution.DistributionConfig.CacheBehaviors.Items
    ) {
      distributionData.distribution.DistributionConfig.CacheBehaviors = {
        Quantity: 0,
        Items: [],
      };
    }
    distributionData.distribution.DistributionConfig.CacheBehaviors.Items?.push(
      {
        TargetOriginId: eventId,
        PathPattern: '/out/v1/*',
        ViewerProtocolPolicy: 'allow-all',
        SmoothStreaming: false,
        Compress: false,
        CachePolicyId: '08627262-05a9-4f76-9ded-b50ca2e3a84f', // Elemental-MediaPackage Cache Policy
        FieldLevelEncryptionId: '',
        AllowedMethods: {
          Quantity: 3,
          Items: ['GET', 'HEAD', 'OPTIONS'],
          CachedMethods: {
            Quantity: 3,
            Items: ['GET', 'HEAD', 'OPTIONS'],
          },
        },
        LambdaFunctionAssociations: { Quantity: 0 },
      }
    );
    distributionData.distribution.DistributionConfig.CacheBehaviors.Quantity =
      distributionData.distribution.DistributionConfig.CacheBehaviors.Items
        ?.length ?? 0;

    await this.client.send(
      new UpdateDistributionCommand({
        Id: distributionId,
        DistributionConfig: distributionData.distribution.DistributionConfig,
        IfMatch: distributionData.eTag,
      })
    );

    const hlsEndpoint = endpoints.find((endpoint) => endpoint.type === EndpointType.HLS);
    if (hlsEndpoint) {
      hlsEndpoint.url = "https://" + distributionData.distribution.DomainName + hlsEndpoint.url.split("amazonaws.com")[1];
    }
    const dashEndpoint = endpoints.find((endpoint) => endpoint.type === EndpointType.DASH);
    if (dashEndpoint) {
      dashEndpoint.url = "https://" + distributionData.distribution.DomainName + dashEndpoint.url.split("amazonaws.com")[1];
    }

    if (!hlsEndpoint || !dashEndpoint) {
      throw new Error('Failed to create CloudFront endpoints');
    }

    return {
      eventId,
      liveChannelArn,
      liveChannelId,
      packageChannelId,
      endpoints: [hlsEndpoint, dashEndpoint],
    };
  }

  public async deleteOrigin(eventId: string): Promise<void> {
    const distributionId = process.env.DISTRIBUTION_ID;
    if (!distributionId) {
      throw new Error('DISTRIBUTION_ID environment variable is not set');
    }
    const distributionData = await this.getDistribution(distributionId);

    if (!distributionData.distribution.DistributionConfig?.Origins?.Items) {
      throw new Error('Distribution has no origins');
    }

    const items =
      distributionData.distribution.DistributionConfig.Origins.Items;
    distributionData.distribution.DistributionConfig.Origins.Items =
      items.filter((origin) => origin.Id !== eventId);
    distributionData.distribution.DistributionConfig.Origins.Quantity =
      distributionData.distribution.DistributionConfig.Origins.Items.length;

    if (
      !distributionData.distribution.DistributionConfig.CacheBehaviors?.Items
    ) {
      throw new Error('Distribution has no cache behaviors');
    }

    distributionData.distribution.DistributionConfig.CacheBehaviors.Items =
      distributionData.distribution.DistributionConfig.CacheBehaviors.Items.filter(
        (behavior) => behavior.TargetOriginId !== eventId
      );
    distributionData.distribution.DistributionConfig.CacheBehaviors.Quantity =
      distributionData.distribution.DistributionConfig.CacheBehaviors.Items.length;

    await this.client.send(
      new UpdateDistributionCommand({
        Id: distributionId,
        DistributionConfig: distributionData.distribution.DistributionConfig,
        IfMatch: distributionData.eTag,
      })
    );
  }
}
