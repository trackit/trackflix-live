import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export abstract class QaManager {
  private readonly s3Client: S3Client;

  private readonly bucketName: string;

  private readonly service: string;

  protected constructor({
    s3Client,
    bucketName,
    service,
  }: {
    s3Client: S3Client;
    bucketName: string;
    service: string;
  }) {
    this.s3Client = s3Client;
    this.bucketName = bucketName;
    this.service = service;
  }

  protected async saveLogs({
    method,
    eventId,
    parameters,
  }: {
    method: string;
    eventId: string;
    parameters: unknown;
  }): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `${eventId}/${new Date().toISOString()}.json`,
        Body: JSON.stringify(
          {
            method,
            service: this.service,
            parameters,
          },
          null,
          2
        ),
      })
    );
  }
}
