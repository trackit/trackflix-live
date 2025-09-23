import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import path from 'path';

export class GoldenLogsManager {
  private readonly s3: S3Client = new S3Client();

  private readonly logsBucket: string;

  public constructor({ logsBucket }: { logsBucket: string }) {
    this.logsBucket = logsBucket;
  }

  public async fetchLogs({
    eventId,
    before,
    after,
  }: {
    eventId: string;
    before?: Date;
    after?: Date;
  }) {
    const listResponse = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.logsBucket,
        Prefix: eventId,
      })
    );

    const logs = await Promise.all(
      listResponse.Contents.map(async (item) => {
        const response = await this.s3.send(
          new GetObjectCommand({
            Bucket: this.logsBucket,
            Key: item.Key,
          })
        );

        return {
          key: item.Key,
          body: JSON.parse(await response.Body.transformToString()),
        };
      })
    );

    const filteredLogs = logs.filter((log) => {
      const logDate = new Date(path.parse(log.key).name);

      if (before !== undefined && logDate > before) {
        return false;
      }

      return !(after !== undefined && logDate < after);
    });

    return filteredLogs.map((item) => item.body);
  }
}
