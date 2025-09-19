import {
  CDNDistributionsManager,
  CreateCDNOriginParameters,
  CreateCDNOriginResponse,
  DeleteCDNOriginParameters,
} from '@trackflix-live/api-events';
import { S3Client } from '@aws-sdk/client-s3';
import { QaManager } from './QaManager';

export class QaCdnDistributionsManager
  extends QaManager
  implements CDNDistributionsManager
{
  public constructor({
    s3Client,
    bucketName,
  }: {
    s3Client: S3Client;
    bucketName: string;
  }) {
    super({ s3Client, bucketName, service: 'CDN' });
  }

  public async createOrigin(
    parameters: CreateCDNOriginParameters
  ): Promise<CreateCDNOriginResponse> {
    await this.saveLogs({
      method: 'createOrigin',
      eventId: parameters.eventId,
      parameters,
    });

    return {
      eventId: parameters.eventId,
      endpoints: parameters.endpoints.map((endpoint) => ({
        type: endpoint.type,
        url: 'MOCK_CLOUDFRONT_ENDPOINT',
      })),
    };
  }

  public async deleteOrigin(
    parameters: DeleteCDNOriginParameters
  ): Promise<void> {
    await this.saveLogs({
      method: 'deleteOrigin',
      eventId: parameters.eventId,
      parameters,
    });
  }
}
