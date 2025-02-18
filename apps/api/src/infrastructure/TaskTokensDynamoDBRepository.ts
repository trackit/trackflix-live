import {
  ConsumeTaskTokenParameters,
  ConsumeTaskTokenResponse,
  CreateTaskTokenParameters,
  TaskTokensRepository,
} from '@trackflix-live/api-events';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

export class TaskTokensDynamoDBRepository implements TaskTokensRepository {
  private readonly client: DynamoDBDocumentClient;

  private readonly tableName: string;

  public constructor({
    client,
    tableName,
  }: {
    client: DynamoDBDocumentClient;
    tableName: string;
  }) {
    this.client = client;
    this.tableName = tableName;
  }

  public async createTaskToken({
    channelArn,
    taskToken,
    output,
    expectedStatus,
  }: CreateTaskTokenParameters): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          key: `${channelArn}#${expectedStatus}`,
          taskToken,
          output,
        },
      })
    );
  }

  public async consumeTaskToken({
    channelArn,
    expectedStatus,
  }: ConsumeTaskTokenParameters): Promise<
    ConsumeTaskTokenResponse | undefined
  > {
    const key = `${channelArn}#${expectedStatus}`;
    const item = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          key,
        },
      })
    );
    if (item.Item === undefined) {
      return;
    }

    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          key,
        },
      })
    );

    return {
      taskToken: item.Item.taskToken,
      output: item.Item.output,
    };
  }
}
