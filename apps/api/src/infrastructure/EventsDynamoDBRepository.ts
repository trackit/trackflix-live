import {
  EventsRepository,
  ListEventsParams,
  ListEventsResponse,
} from '@trackflix-live/api-events';
import {
  DeleteCommand,
  DeleteCommandInput,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { Event, EventEndpoint, EventLog } from '@trackflix-live/types';
import { NotFoundError } from '../handlers/HttpErrors';

export class EventsDynamoDBRepository implements EventsRepository {
  private readonly client: DynamoDBDocumentClient;

  private readonly tableName: string;

  /* Contains all attributes to return when listing events or getting one. */
  private readonly expressionAttributeNames = {
    '#id': 'id',
    '#name': 'name',
    '#description': 'description',
    '#onAirStartTime': 'onAirStartTime',
    '#onAirEndTime': 'onAirEndTime',
    '#createdTime': 'createdTime',
    '#destroyedTime': 'destroyedTime',
    '#source': 'source',
    '#status': 'status',
    '#liveChannelArn': 'liveChannelArn',
    '#liveChannelId': 'liveChannelId',
    '#liveInputId': 'liveInputId',
    '#liveWaitingInputId': 'liveWaitingInputId',
    '#logs': 'logs',
    '#endpoints': 'endpoints',
  };
  private readonly projectionExpression = Object.keys(
    this.expressionAttributeNames
  ).join(', ');

  private readonly gsiProperties = {
    'GSI-name-PK': 'name',
    'GSI-onAirStartTime-PK': 'onAirStartTime',
    'GSI-onAirEndTime-PK': 'onAirEndTime',
    'GSI-status-PK': 'status',
  };

  constructor(client: DynamoDBDocumentClient, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  async createEvent(event: Event): Promise<void> {
    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: {
        ...event,
        ...this.gsiProperties,
        nameLowercase: event.name.trim().toLowerCase(),
      },
    };

    await this.client.send(new PutCommand(params));
  }

  async listEvents({
    limit,
    nextToken,
    sortOrder = 'asc',
    sortBy,
    name,
  }: ListEventsParams): Promise<ListEventsResponse> {
    const defaultInput: QueryCommandInput | ScanCommandInput = {
      TableName: this.tableName,
      ProjectionExpression: this.projectionExpression,
      Limit: limit,
      ExclusiveStartKey: nextToken
        ? JSON.parse(Buffer.from(nextToken, 'base64').toString())
        : undefined,
      ExpressionAttributeNames: this.expressionAttributeNames,
    };
    let response: ScanCommandOutput | QueryCommandOutput;

    if (name) {
      defaultInput.FilterExpression =
        'contains(#nameLowercase, :nameLowercase)';
      defaultInput.ExpressionAttributeNames = {
        ...defaultInput.ExpressionAttributeNames,
        '#nameLowercase': 'nameLowercase',
      };
      defaultInput.ExpressionAttributeValues = {
        ...defaultInput.ExpressionAttributeValues,
        ':nameLowercase': name.trim().toLowerCase(),
      };
    }

    if (sortBy) {
      response = (await this.client.send(
        new QueryCommand({
          ...(defaultInput satisfies QueryCommandInput),
          IndexName: `GSI-${sortBy}`,
          ScanIndexForward: sortOrder === 'asc',
          KeyConditionExpression: '#PK = :PK',
          ExpressionAttributeValues: {
            ...defaultInput.ExpressionAttributeValues,
            ':PK': sortBy,
          },
          ExpressionAttributeNames: {
            ...defaultInput.ExpressionAttributeNames,
            '#PK': `GSI-${sortBy}-PK`,
          },
        })
      )) satisfies QueryCommandOutput;
    } else {
      response = (await this.client.send(
        new ScanCommand(defaultInput satisfies ScanCommandInput)
      )) satisfies ScanCommandOutput;
    }

    return {
      events: response.Items as Event[],
      nextToken: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString(
            'base64'
          )
        : null,
    };
  }

  async getEvent(eventId: string): Promise<Event | undefined> {
    const params: GetCommandInput = {
      TableName: this.tableName,
      ProjectionExpression: this.projectionExpression,
      ExpressionAttributeNames: this.expressionAttributeNames,
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

  public async updateLiveWaitingInputId(
    eventId: string,
    liveWaitingInputId: string
  ): Promise<Event> {
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: {
        id: eventId,
      },
      UpdateExpression: 'SET #liveWaitingInputId = :liveWaitingInputId',
      ExpressionAttributeNames: {
        '#liveWaitingInputId': 'liveWaitingInputId',
      },
      ExpressionAttributeValues: {
        ':liveWaitingInputId': liveWaitingInputId,
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

  async deleteEvent(eventId: string): Promise<void> {
    const params: DeleteCommandInput = {
      TableName: this.tableName,
      Key: {
        id: eventId,
      },
      ConditionExpression: 'attribute_exists(id)',
    };

    try {
      await this.client.send(new DeleteCommand(params));
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new NotFoundError();
      }

      throw error;
    }
  }
}
