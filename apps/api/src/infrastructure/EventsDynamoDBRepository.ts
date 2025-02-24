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
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { Event, EventEndpoint, EventLog } from '@trackflix-live/types';

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
      Item: event,
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

    return response.Item as Event;
  }

  async appendLogsToEvent(eventId: string, logs: EventLog[]): Promise<Event> {
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: {
        id: eventId,
      },
      UpdateExpression: 'SET #logs = list_append(#logs, :logs)',
      ExpressionAttributeNames: {
        '#logs': 'logs',
      },
      ExpressionAttributeValues: {
        ':logs': logs,
      },
      ReturnValues: 'ALL_NEW',
    };

    const response = await this.client.send(new UpdateCommand(params));

    return response.Attributes as Event;
  }

  async appendEndpointsToEvent(
    eventId: string,
    endpoints: EventEndpoint[]
  ): Promise<Event> {
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: {
        id: eventId,
      },
      UpdateExpression: 'SET #endpoints = list_append(#endpoints, :endpoints)',
      ExpressionAttributeNames: {
        '#endpoints': 'endpoints',
      },
      ExpressionAttributeValues: {
        ':endpoints': endpoints,
      },
      ReturnValues: 'ALL_NEW',
    };

    const response = await this.client.send(new UpdateCommand(params));

    return response.Attributes as Event;
  }

  async updateEventStatus(eventId: string, status: string): Promise<Event> {
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: {
        id: eventId,
      },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
      },
      ReturnValues: 'ALL_NEW',
    };

    const response = await this.client.send(new UpdateCommand(params));

    return response.Attributes as Event;
  }
}
