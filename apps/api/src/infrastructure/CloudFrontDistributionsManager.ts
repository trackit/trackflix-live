import {
  CDNDistributionsManager,
  CreateCDNDistributionResponse,
} from '@trackflix-live/api-events';
import {
  CloudFrontClient,
  CreateDistributionCommand,
  DeleteDistributionCommand,
} from '@aws-sdk/client-cloudfront';

export class CloudFrontDistributionsManager implements CDNDistributionsManager {
  private readonly client: CloudFrontClient;

  public constructor({ client }: { client: CloudFrontClient }) {
    this.client = client;
  }

  public async createDistribution(
    eventId: string,
    packageDomainName: string,
  ): Promise<CreateCDNDistributionResponse> {
    const response = await this.client.send(
      new CreateDistributionCommand({
        DistributionConfig: {
          CallerReference: eventId,
          Origins: {
            Quantity: 1,
            Items: [{
              Id: 'mediapackage-origin',
              DomainName: packageDomainName,
              /// DomainName: ////, id from media package endpoints
              /// from: https://ef12a945743b4a46.mediapackage.us-west-2.amazonaws.com/out/v1/27616a12d47141028ca4a21e16ddd18b/index.mpd
              /// need: ef12a945743b4a46.mediapackage.us-west-2.amazonaws.com
            }]
          },
          DefaultCacheBehavior: {
            TargetOriginId: 'mediapackage-origin',
            ViewerProtocolPolicy: 'allow-all',
            AllowedMethods: {
              Quantity: 3,
              Items: ['GET', 'HEAD', 'OPTIONS'],
              CachedMethods: {
                Quantity: 3,
                Items: ['GET', 'HEAD', 'OPTIONS']
              }
            },
          },
          Comment: `Distribution for event ${eventId}`,
          Enabled: true
        }
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
}
