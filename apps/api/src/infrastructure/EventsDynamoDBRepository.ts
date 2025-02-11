import {
  EventsRepository,
  ListEventsResponse,
} from '@trackflix-live/api-events';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { Event } from '@trackflix-live/types';

export class EventsDynamoDBRepository implements EventsRepository {
  private readonly client: DynamoDBDocumentClient;

  private readonly tableName: string;

  constructor(client: DynamoDBDocumentClient, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  async createEvent(event: Event): Promise<void> {
    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: {
        ...event,
        onAirStartTime: event.onAirStartTime.toISOString(),
        onAirEndTime: event.onAirEndTime.toISOString(),
      },
    };

    await this.client.send(new PutCommand(params));
  }

  async listEvents(
    limit: number,
    nextToken?: string
  ): Promise<ListEventsResponse> {
    const params: ScanCommandInput = {
      TableName: this.tableName,
      Limit: limit,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, 'base64').toString())
        : undefined,
    };

    const { Items, LastEvaluatedKey } = await this.client.send(
      new ScanCommand(params)
    );

    return {
      events: Items as Event[],
      nextToken: LastEvaluatedKey
        ? Buffer.from(JSON.stringify(LastEvaluatedKey)).toString('base64')
        : null,
    };
  }

  async getEvent(eventId: string): Promise<Event | undefined> {
    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: {
        id: eventId,
      },
    };

    const response = await this.client.send(new GetCommand(params));

    if (!response.Item) {
      return undefined;
    }

    return {
      ...response.Item,
      onAirStartTime: new Date(response?.Item?.onAirStartTime),
      onAirEndTime: new Date(response?.Item?.onAirEndTime),
    } as Event;
  }
}
