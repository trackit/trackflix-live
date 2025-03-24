import {
  CDNDistributionsManager,
  CreateCDNDistributionResponse,
} from '@trackflix-live/api-events';
import {
  CloudFrontClient,
  CreateDistributionCommand,
  DeleteDistributionCommand,
  Distribution,
  GetDistributionCommand,
  UpdateDistributionCommand,
} from '@aws-sdk/client-cloudfront';

export class CloudFrontDistributionsManager implements CDNDistributionsManager {
  private readonly client: CloudFrontClient;

  public constructor({ client }: { client: CloudFrontClient }) {
    this.client = client;
  }

  public async createDistribution(): Promise<CreateCDNDistributionResponse> {
    const response = await this.client.send(
      new CreateDistributionCommand({
        DistributionConfig: {
          CallerReference: 'Trackflix-live events',
          Origins: {
            Quantity: 1,
            Items: [
              {
                Id: 'dummy-origin',
                DomainName: 'trackit.io',
              },
            ],
          },
          DefaultCacheBehavior: {
            TargetOriginId: 'dummy-origin',
            ViewerProtocolPolicy: 'allow-all',
            AllowedMethods: {
              Quantity: 3,
              Items: ['GET', 'HEAD', 'OPTIONS'],
              CachedMethods: {
                Quantity: 3,
                Items: ['GET', 'HEAD', 'OPTIONS'],
              },
            },
          },
          Comment: `Distribution for Trackflix-live events`,
          Enabled: true,
        },
      })
    );

    if (!response.Distribution?.Id) {
      throw new Error('Failed to create CloudFront distribution');
    }

    return {
      cdnDistributionId: response.Distribution?.Id,
    };
  }

  public async deleteDistribution(cdnDistributionId: string): Promise<void> {
    await this.client.send(
      new DeleteDistributionCommand({
        Id: cdnDistributionId,
      })
    );
  }

  public async getDistribution(
    cdnDistributionId: string
  ): Promise<Distribution> {
    const response = await this.client.send(
      new GetDistributionCommand({
        Id: cdnDistributionId,
      })
    );

    if (!response.Distribution) {
      throw new Error('Failed to get CloudFront distribution');
    }

    return response.Distribution;
  }

  public async createOrigin(
    eventId: string,
    cdnDistributionId: string,
    packageDomainName: string
  ): Promise<void> {
    const distribution = await this.getDistribution(cdnDistributionId);

    if (!distribution.DistributionConfig) {
      throw new Error('Distribution has no config');
    }

    if (!distribution.DistributionConfig.Origins) {
      distribution.DistributionConfig.Origins = {
        Quantity: 0,
        Items: [],
      };
    }
    distribution.DistributionConfig.Origins.Items?.push({
      Id: eventId,
      DomainName: packageDomainName,
    });
    distribution.DistributionConfig.Origins.Quantity =
      distribution.DistributionConfig.Origins.Items?.length ?? 0;

    if (!distribution.DistributionConfig.CacheBehaviors) {
      distribution.DistributionConfig.CacheBehaviors = {
        Quantity: 0,
        Items: [],
      };
    }
    distribution.DistributionConfig.CacheBehaviors.Items?.push({
      TargetOriginId: eventId,
      PathPattern: '/out/v1/*',
      ViewerProtocolPolicy: 'allow-all',
    });
    distribution.DistributionConfig.CacheBehaviors.Quantity =
      distribution.DistributionConfig.CacheBehaviors.Items?.length ?? 0;

    await this.client.send(
      new UpdateDistributionCommand({
        Id: cdnDistributionId,
        DistributionConfig: distribution.DistributionConfig,
      })
    );
  }

  public async deleteOrigin(
    cdnDistributionId: string,
    eventId: string
  ): Promise<void> {
    const distribution = await this.getDistribution(cdnDistributionId);

    if (!distribution.DistributionConfig?.Origins?.Items) {
      throw new Error('Distribution has no origins');
    }

    const items = distribution.DistributionConfig.Origins.Items;
    distribution.DistributionConfig.Origins.Items = items.filter(
      (origin) => origin.Id !== eventId
    );
    distribution.DistributionConfig.Origins.Quantity =
      distribution.DistributionConfig.Origins.Items.length;

    if (!distribution.DistributionConfig.CacheBehaviors?.Items) {
      throw new Error('Distribution has no cache behaviors');
    }

    distribution.DistributionConfig.CacheBehaviors.Items =
      distribution.DistributionConfig.CacheBehaviors.Items.filter(
        (behavior) => behavior.TargetOriginId !== eventId
      );
    distribution.DistributionConfig.CacheBehaviors.Quantity =
      distribution.DistributionConfig.CacheBehaviors.Items.length;

    await this.client.send(
      new UpdateDistributionCommand({
        Id: cdnDistributionId,
        DistributionConfig: distribution.DistributionConfig,
      })
    );
  }
}
