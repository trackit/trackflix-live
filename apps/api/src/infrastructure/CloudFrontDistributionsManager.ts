import {
  CDNDistributionsManager,
  CreateCDNOriginParameters,
  CreateCDNOriginResponse,
  DeleteCDNOriginParameters,
} from '@trackflix-live/api-events';
import {
  CacheBehavior,
  CloudFrontClient,
  Distribution,
  GetDistributionCommand,
  UpdateDistributionCommand,
} from '@aws-sdk/client-cloudfront';
import { EndpointType } from '@trackflix-live/types';

export class CloudFrontDistributionsManager implements CDNDistributionsManager {
  private readonly client: CloudFrontClient;
  private readonly cdnDistributionId: string;

  public constructor({
    client,
    cdnDistributionId,
  }: {
    client: CloudFrontClient;
    cdnDistributionId: string;
  }) {
    this.cdnDistributionId = cdnDistributionId;
    this.client = client;
  }

  public async getDistribution(): Promise<{
    distribution: Distribution;
    eTag: string;
  }> {
    const response = await this.client.send(
      new GetDistributionCommand({
        Id: this.cdnDistributionId,
      })
    );
    if (!response.Distribution) {
      throw new Error('Failed to get CloudFront distribution');
    }

    return { distribution: response.Distribution, eTag: response.ETag ?? '' };
  }

  private getCacheBehaviorsConfig(
    eventId: string,
    pathPattern: string
  ): CacheBehavior {
    return {
      TargetOriginId: eventId,
      PathPattern: pathPattern,
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
    };
  }

  public async createOrigin({
    eventId,
    packageDomainName,
    verticalPackageDomainName,
    endpoints,
  }: CreateCDNOriginParameters): Promise<CreateCDNOriginResponse> {
    const distributionData = await this.getDistribution();

    if (!distributionData.distribution.DistributionConfig) {
      throw new Error('Distribution has no config');
    }

    if (!distributionData.distribution.DistributionConfig.Origins) {
      distributionData.distribution.DistributionConfig.Origins = {
        Quantity: 0,
        Items: [],
      };
    }

    if (
      !distributionData.distribution.DistributionConfig.CacheBehaviors ||
      !distributionData.distribution.DistributionConfig.CacheBehaviors.Items
    ) {
      distributionData.distribution.DistributionConfig.CacheBehaviors = {
        Quantity: 0,
        Items: [],
      };
    }

    const orientations = [...new Set(endpoints.map((e) => e.orientation))];

    for (const orientation of orientations) {
      const isVertical = orientation === 'VERTICAL';
      const originId = isVertical ? `${eventId}-vertical` : eventId;
      const domainName =
        isVertical && verticalPackageDomainName
          ? verticalPackageDomainName
          : packageDomainName;

      // Add Origin
      distributionData.distribution.DistributionConfig.Origins.Items?.push({
        Id: originId,
        DomainName: domainName,
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

      // Add Cache Behaviors for this orientation
      const orientationEndpoints = endpoints.filter(
        (e) => e.orientation === orientation
      );

      for (const endpoint of orientationEndpoints) {
        const pathPattern = endpoint.url.split('amazonaws.com')[1];
        const pathPatternWithoutLastSlash =
          pathPattern.split('/').slice(0, -1).join('/') + '/*';

        distributionData.distribution.DistributionConfig.CacheBehaviors.Items?.push(
          this.getCacheBehaviorsConfig(originId, pathPatternWithoutLastSlash)
        );

        // Update endpoint URL to use CloudFront domain
        endpoint.url =
          'https://' +
          distributionData.distribution.DomainName +
          pathPattern;
      }
    }

    distributionData.distribution.DistributionConfig.Origins.Quantity =
      distributionData.distribution.DistributionConfig.Origins.Items?.length ??
      0;
    distributionData.distribution.DistributionConfig.CacheBehaviors.Quantity =
      distributionData.distribution.DistributionConfig.CacheBehaviors.Items
        ?.length ?? 0;

    await this.client.send(
      new UpdateDistributionCommand({
        Id: this.cdnDistributionId,
        DistributionConfig: distributionData.distribution.DistributionConfig,
        IfMatch: distributionData.eTag,
      })
    );

    return {
      eventId,
      endpoints,
    };
  }

  public async deleteOrigin({
    eventId,
  }: DeleteCDNOriginParameters): Promise<void> {
    const distributionData = await this.getDistribution();

    if (!distributionData.distribution.DistributionConfig?.Origins?.Items) {
      throw new Error('Distribution has no origins');
    }

    const origins =
      distributionData.distribution.DistributionConfig.Origins.Items;
    distributionData.distribution.DistributionConfig.Origins.Items =
      origins.filter((origin) => origin.Id !== eventId && origin.Id !== `${eventId}-vertical`);
    distributionData.distribution.DistributionConfig.Origins.Quantity =
      distributionData.distribution.DistributionConfig.Origins.Items.length;

    if (
      !distributionData.distribution.DistributionConfig.CacheBehaviors?.Items
    ) {
      throw new Error('Distribution has no cache behaviors');
    }

    distributionData.distribution.DistributionConfig.CacheBehaviors.Items =
      distributionData.distribution.DistributionConfig.CacheBehaviors.Items.filter(
        (behavior) => behavior.TargetOriginId !== eventId && behavior.TargetOriginId !== `${eventId}-vertical`
      );
    distributionData.distribution.DistributionConfig.CacheBehaviors.Quantity =
      distributionData.distribution.DistributionConfig.CacheBehaviors.Items.length;

    await this.client.send(
      new UpdateDistributionCommand({
        Id: this.cdnDistributionId,
        DistributionConfig: distributionData.distribution.DistributionConfig,
        IfMatch: distributionData.eTag,
      })
    );
  }
}
