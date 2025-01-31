import { EventsRepository } from "@trackflix-live/api-events";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Event } from "@trackflix-live/types";

export class EventsDynamoDBRepository implements EventsRepository {

  private readonly _client: DynamoDBDocumentClient;

  private readonly _tableName: string;

  constructor(client: DynamoDBClient, tableName: string) {
    this._client = DynamoDBDocumentClient.from(client);
    this._tableName = tableName;
  }

  async createEvent(event: Event): Promise<void> {
    const params: PutCommandInput = {
      TableName: this._tableName,
      Item: {
        id: event.id,
        name: event.name,
        description: event.description,
        onAirStartTime: event.onAirStartTime.toISOString(),
        onAirEndTime: event.onAirEndTime.toISOString(),
        source: {
          bucket: event.source.bucket,
          key: event.source.key,
        },
        status: event.status,
      },
    };

    await this._client.send(new PutCommand(params));
  }
}
