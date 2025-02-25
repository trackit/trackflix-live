import {
  EventsRepository,
  ListEventsParams,
  ListEventsResponse,
} from '@trackflix-live/api-events';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
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
      Item: {
        ...event,
      },
    };

    await this.client.send(new PutCommand(params));
  }

  private async listEventsSimple({ limit, nextToken }: ListEventsParams) {
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

    return { Items, LastEvaluatedKey } as {
      Items: Event[];
      LastEvaluatedKey: Event;
    };
  }

  private async listEventsSorted({
    limit,
    nextToken,
    sortOrder,
    sortBy,
  }: ListEventsParams) {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: `GSI-${sortBy}`,
      ScanIndexForward: sortOrder === 'asc',
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeValues: {
        ':PK': sortBy,
      },
      ExpressionAttributeNames: {
        '#PK': `GSI-${sortBy}-PK`,
      },
      Limit: limit,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, 'base64').toString())
        : undefined,
    };

    const { Items, LastEvaluatedKey } = await this.client.send(
      new QueryCommand(params)
    );

    return { Items, LastEvaluatedKey } as {
      Items: Event[];
      LastEvaluatedKey: Event;
    };
  }

  async listEvents({
    limit,
    nextToken,
    sortOrder,
    sortBy,
  }: ListEventsParams): Promise<ListEventsResponse> {
    let items: Event[];
    let lastEvaluatedKey: Event;

    if (sortBy) {
      ({ Items: items, LastEvaluatedKey: lastEvaluatedKey } =
        await this.listEventsSorted({
          limit,
          nextToken,
          sortOrder,
          sortBy,
        }));
    } else {
      ({ Items: items, LastEvaluatedKey: lastEvaluatedKey } =
        await this.listEventsSimple({
          limit,
          nextToken,
        }));
    }

    return {
      events: items as Event[],
      nextToken: lastEvaluatedKey
        ? Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64')
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

  public async updateLiveChannelArn(
    eventId: string,
    liveChannelArn: string
  ): Promise<Event> {
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: {
        id: eventId,
      },
      UpdateExpression: 'SET #liveChannelArn = :liveChannelArn',
      ExpressionAttributeNames: {
        '#liveChannelArn': 'liveChannelArn',
      },
      ExpressionAttributeValues: {
        ':liveChannelArn': liveChannelArn,
      },
      ReturnValues: 'ALL_NEW',
    };

    const response = await this.client.send(new UpdateCommand(params));

    return response.Attributes as Event;
  }

  public async updateLiveChannelId(
    eventId: string,
    liveChannelId: string
  ): Promise<Event> {
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: {
        id: eventId,
      },
      UpdateExpression: 'SET #liveChannelId = :liveChannelId',
      ExpressionAttributeNames: {
        '#liveChannelId': 'liveChannelId',
      },
      ExpressionAttributeValues: {
        ':liveChannelId': liveChannelId,
      },
      ReturnValues: 'ALL_NEW',
    };

    const response = await this.client.send(new UpdateCommand(params));

    return response.Attributes as Event;
  }

  public async updateLiveInputId(
    eventId: string,
    liveInputId: string
  ): Promise<Event> {
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: {
        id: eventId,
      },
      UpdateExpression: 'SET #liveInputId = :liveInputId',
      ExpressionAttributeNames: {
        '#liveInputId': 'liveInputId',
      },
      ExpressionAttributeValues: {
        ':liveInputId': liveInputId,
      },
      ReturnValues: 'ALL_NEW',
    };

    const response = await this.client.send(new UpdateCommand(params));

    return response.Attributes as Event;
  }

  public async updateEventDestroyedTime(
    eventId: string,
    destroyedTime: string
  ): Promise<Event> {
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: {
        id: eventId,
      },
      UpdateExpression: 'SET #destroyedTime = :destroyedTime',
      ExpressionAttributeNames: {
        '#destroyedTime': 'destroyedTime',
      },
      ExpressionAttributeValues: {
        ':destroyedTime': destroyedTime,
      },
      ReturnValues: 'ALL_NEW',
    };

    const response = await this.client.send(new UpdateCommand(params));

    return response.Attributes as Event;
  }
}
