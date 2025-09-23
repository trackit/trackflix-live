import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

export class GoldenDatabasesManager {
  private readonly dynamo: DynamoDBClient = new DynamoDBClient();

  private readonly eventsTableName: string;

  public constructor({ eventsTableName }: { eventsTableName: string }) {
    this.eventsTableName = eventsTableName;
  }

  public async wipeDatabase() {
    const items = await this.dynamo.send(
      new ScanCommand({
        TableName: this.eventsTableName,
        Limit: 100,
      })
    );
    await Promise.all(
      (items.Items || []).map(async (item) => {
        await this.dynamo.send(
          new DeleteCommand({
            TableName: this.eventsTableName,
            Key: {
              id: item.id.S,
            },
          })
        );
      })
    );
  }
}
