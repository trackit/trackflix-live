import { AssetsService } from '@trackflix-live/api-events';
import {
  HeadObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';

export class S3AssetsService implements AssetsService {
  private readonly client: S3Client;

  public constructor(client: S3Client) {
    this.client = client;
  }

  public async assetExists(uri: string): Promise<boolean> {
    const parsedUrl = URL.parse(uri);
    if (parsedUrl === null) {
      throw new Error('Invalid URL');
    }

    const { host: bucket, pathname: key } = parsedUrl;

    try {
      const response = await this.client.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: key.slice(1),
        })
      );

      return response.$metadata.httpStatusCode === 200;
    } catch (e: unknown) {
      if (e instanceof S3ServiceException) {
        if (e.name === 'NotFound') {
          return false;
        }
      }
      throw e;
    }
  }
}
