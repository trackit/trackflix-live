import {
  CreateChannelParameters,
  CreateChannelResponse,
  LiveChannelsManager,
  StartChannelParameters,
} from '@trackflix-live/api-events';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

export class QaLiveChannelsManager implements LiveChannelsManager {
  private readonly sqsClient: SQSClient;

  private readonly queueUrl: string;

  public constructor({
    sqsClient,
    queueUrl,
  }: {
    sqsClient: SQSClient;
    queueUrl: string;
  }) {
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

    console.log('createChannel', JSON.stringify(parameters, null, 2));
    return {
      channelId: parameters.eventId,
      channelArn: parameters.eventId,
      inputId: 'MOCK_INPUT_ID',
      waitingInputId: 'MOCK_WAITING_INPUT_ID',
    };
  }

  public async deleteChannel(channelId: string): Promise<void> {
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify({
          channelArn: channelId,
          state: 'DELETED',
        }),
      })
    );

    console.log('deleteChannel', JSON.stringify(channelId, null, 2));
  }

  public async deleteInput(inputId: string): Promise<void> {
    console.log('deleteInput', JSON.stringify(inputId, null, 2));
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

    console.log('startChannel', JSON.stringify(parameters, null, 2));
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

    console.log('stopChannel', JSON.stringify(channelId, null, 2));
  }
}
