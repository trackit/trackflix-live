import {
  CreatePackageChannelResponse,
  PackageChannelsManager,
} from '@trackflix-live/api-events';
import { EndpointType } from '@trackflix-live/types';
import { S3Client } from '@aws-sdk/client-s3';
import { QaManager } from './QaManager';

export class QaPackageChannelsManager
  extends QaManager
  implements PackageChannelsManager
{
  public constructor({
    s3Client,
    bucketName,
  }: {
    s3Client: S3Client;
    bucketName: string;
  }) {
    super({ s3Client, bucketName, service: 'Package' });
  }

  public async createChannel(
    eventId: string
  ): Promise<CreatePackageChannelResponse> {
    await this.saveLogs({
      method: 'createChannel',
      eventId: eventId,
      parameters: eventId,
    });

    return {
      channelId: eventId,
      endpoints: [
        {
          type: EndpointType.HLS,
          url: 'MOCK_HLS_ENDPOINT',
        },
        {
          type: EndpointType.DASH,
          url: 'MOCK_DASH_ENDPOINT',
        },
      ],
    };
  }

  public async deleteChannel(channelId: string): Promise<void> {
    await this.saveLogs({
      method: 'deleteChannel',
      eventId: channelId,
      parameters: channelId,
    });

    return Promise.resolve(undefined);
  }
}
