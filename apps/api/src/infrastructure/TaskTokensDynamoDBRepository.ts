import {
  CreateTaskTokenParameters,
  TaskTokensRepository,
} from '@trackflix-live/api-events';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

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
}
