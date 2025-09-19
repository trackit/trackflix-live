import {
  CreateChannelParameters,
  CreateChannelResponse,
  LiveChannelsManager,
  StartChannelParameters,
} from '@trackflix-live/api-events';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { S3Client } from '@aws-sdk/client-s3';
import { QaManager } from './QaManager';

export class QaLiveChannelsManager
  extends QaManager
  implements LiveChannelsManager
{
  private readonly sqsClient: SQSClient;

  private readonly queueUrl: string;

  public constructor({
    sqsClient,
    queueUrl,
    s3Client,
    bucketName,
  }: {
    sqsClient: SQSClient;
    queueUrl: string;
    s3Client: S3Client;
    bucketName: string;
  }) {
    super({ s3Client, bucketName, service: 'Live' });
    this.sqsClient = sqsClient;
    this.queueUrl = queueUrl;
  }

  public async createChannel(
    parameters: CreateChannelParameters
  ): Promise<CreateChannelResponse> {
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify({
          channelArn: parameters.eventId,
          state: 'CREATED',
        }),
      })
    );

    await this.saveLogs({
      method: 'createChannel',
      eventId: parameters.eventId,
      parameters,
    });

    return {
      channelId: parameters.eventId,
      channelArn: parameters.eventId,
      inputId: 'MOCK_INPUT_ID',
      waitingInputId: 'MOCK_WAITING_INPUT_ID',
    };
  }

  public async deleteChannel(channelId: string): Promise<void> {
    await this.saveLogs({
      method: 'deleteChannel',
      eventId: channelId,
      parameters: channelId,
    });

    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify({
          channelArn: channelId,
          state: 'DELETED',
        }),
      })
    );
  }

  public async deleteInput(inputId: string): Promise<void> {
    await this.saveLogs({
      method: 'deleteInput',
      eventId: inputId,
      parameters: inputId,
    });
  }

  public async startChannel(parameters: StartChannelParameters): Promise<void> {
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify({
          channelArn: parameters.eventId,
          state: 'RUNNING',
        }),
      })
    );

    await this.saveLogs({
      method: 'startChannel',
      eventId: parameters.eventId,
      parameters,
    });
  }

  public async stopChannel(channelId: string): Promise<void> {
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify({
          channelArn: channelId,
          state: 'STOPPED',
        }),
      })
    );

    await this.saveLogs({
      method: 'stopChannel',
      eventId: channelId,
      parameters: channelId,
    });
  }
}
