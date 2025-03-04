import { EventsDynamoDBRepository } from './EventsDynamoDBRepository';
import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import {
  EndpointType,
  EventDoesNotExistError,
  EventEndpoint,
  EventMother,
  EventStatus,
  LogType,
} from '@trackflix-live/types';

describe('EventsDynamoDBRepository', () => {
  beforeEach(async () => {
    const { createTable } = setup();
    await createTable();
  });

  afterEach(async () => {
    const { deleteTable } = setup();
    await deleteTable();
  });

  it('should create an event in DynamoDB', async () => {
    const { ddbClient, repository } = setup();

    const sampleEvent = EventMother.basic().build();
    const response = await repository.createEvent(sampleEvent);

    const command = new GetCommand({
      TableName: 'EventsTable',
      Key: {
        id: sampleEvent.id,
      },
    });
    const responseFromDB = await ddbClient.send(command);

    expect(response).toBeUndefined();
    expect(responseFromDB.Item).toMatchObject(sampleEvent);
  });

  it('should list events from DynamoDB', async () => {
    const { repository } = setup();

    const sampleEvent = EventMother.basic().build();
    await repository.createEvent(sampleEvent);

    const response = await repository.listEvents({ limit: 10 });

    expect(response.events).toMatchObject([sampleEvent]);
    expect(response.nextToken).toBeNull();
  });

  it('should return events in multiple requests if limit is less than the number of events', async () => {
    const { repository } = setup();

    await repository.createEvent(
      EventMother.basic().withId('37bfc238-6ef4-45a4-b874-9d8c2525ac5f').build()
    );
    await repository.createEvent(
      EventMother.basic().withId('7bb6463a-0fe0-4a25-a0c0-04fa14f66f5e').build()
    );
    await repository.createEvent(
      EventMother.basic().withId('a69fd9cb-a581-4797-a5c6-2e6bdfd18e70').build()
    );

    const response = await repository.listEvents({ limit: 1 });

    expect(response.events.length).toBe(1);
    expect(response.nextToken).toBeDefined();

    const response2 = await repository.listEvents({
      limit: 3,
      nextToken: response.nextToken as string,
    });

    expect(response2.events.length).toBe(2);
    expect(response2.nextToken).toBeNull();
  });

  it('should get an event from DynamoDB', async () => {
    const { repository } = setup();

    const sampleEvent = EventMother.basic().build();
    await repository.createEvent(sampleEvent);

    const response = await repository.getEvent(sampleEvent.id);

    expect(response).toMatchObject(sampleEvent);
  });

  it('should append logs to an event', async () => {
    const { ddbClient, repository } = setup();

    const sampleEvent = EventMother.basic().build();
    await repository.createEvent(sampleEvent);

    const log = {
      timestamp: Date.now(),
      type: LogType.PACKAGE_CHANNEL_CREATED,
    };

    await repository.appendLogsToEvent(sampleEvent.id, [log]);

    const command = new GetCommand({
      TableName: 'EventsTable',
      Key: {
        id: sampleEvent.id,
      },
    });
    const responseFromDB = await ddbClient.send(command);

    expect(responseFromDB.Item).toMatchObject({
      ...sampleEvent,
      logs: [log],
    });
  });

  it('should append endpoints to an event', async () => {
    const { ddbClient, repository } = setup();

    const firstEndpoint = {
      url: 'https://formula-1.com/live/dash/monaco-gp-2025.m3u8',
      type: EndpointType.HLS,
    };
    const sampleEvent = EventMother.basic()
      .withEndpoints([firstEndpoint])
      .build();
    await repository.createEvent(sampleEvent);

    const newEndpoint: EventEndpoint = {
      url: 'https://formula-1.com/live/dash/monaco-gp-2025.dash',
      type: EndpointType.DASH,
    };

    await repository.appendEndpointsToEvent(sampleEvent.id, [newEndpoint]);

    const command = new GetCommand({
      TableName: 'EventsTable',
      Key: {
        id: sampleEvent.id,
      },
    });
    const responseFromDB = await ddbClient.send(command);

    expect(responseFromDB.Item).toMatchObject({
      ...sampleEvent,
      endpoints: [firstEndpoint, newEndpoint],
    });
  });

  it('should update event status', async () => {
    const { ddbClient, repository } = setup();

    const sampleEvent = EventMother.basic()
      .withStatus(EventStatus.PRE_TX)
      .build();
    await repository.createEvent(sampleEvent);

    await repository.updateEventStatus(sampleEvent.id, EventStatus.TX);

    const command = new GetCommand({
      TableName: 'EventsTable',
      Key: {
        id: sampleEvent.id,
      },
    });
    const responseFromDB = await ddbClient.send(command);

    expect(responseFromDB.Item).toMatchObject({
      ...sampleEvent,
      status: EventStatus.TX,
    });
  });

  it('should update event live channel arn', async () => {
    const { ddbClient, repository } = setup();

    const sampleEvent = EventMother.basic().build();
    const liveChannelArn =
      'arn:aws:medialive:us-west-2:000000000000:channel:1672338';
    await repository.createEvent(sampleEvent);

    await repository.updateLiveChannelArn(sampleEvent.id, liveChannelArn);

    const command = new GetCommand({
      TableName: 'EventsTable',
      Key: {
        id: sampleEvent.id,
      },
    });
    const responseFromDB = await ddbClient.send(command);

    expect(responseFromDB.Item).toMatchObject({
      ...sampleEvent,
      liveChannelArn,
    });
  });

  it('should update event live channel id', async () => {
    const { ddbClient, repository } = setup();

    const sampleEvent = EventMother.basic().build();
    const liveChannelId = '1672338';
    await repository.createEvent(sampleEvent);

    await repository.updateLiveChannelId(sampleEvent.id, liveChannelId);

    const command = new GetCommand({
      TableName: 'EventsTable',
      Key: {
        id: sampleEvent.id,
      },
    });
    const responseFromDB = await ddbClient.send(command);

    expect(responseFromDB.Item).toMatchObject({
      ...sampleEvent,
      liveChannelId,
    });
  });

  it('should update event live input id', async () => {
    const { ddbClient, repository } = setup();

    const sampleEvent = EventMother.basic().build();
    const liveInputId = '1672338';
    await repository.createEvent(sampleEvent);

    await repository.updateLiveInputId(sampleEvent.id, liveInputId);

    const command = new GetCommand({
      TableName: 'EventsTable',
      Key: {
        id: sampleEvent.id,
      },
    });
    const responseFromDB = await ddbClient.send(command);

    expect(responseFromDB.Item).toMatchObject({
      ...sampleEvent,
      liveInputId,
    });
  });

  it('should update event live waiting input id', async () => {
    const { ddbClient, repository } = setup();

    const sampleEvent = EventMother.basic().build();
    const liveWaitingInputId = '1672338';
    await repository.createEvent(sampleEvent);

    await repository.updateLiveWaitingInputId(
      sampleEvent.id,
      liveWaitingInputId
    );

    const command = new GetCommand({
      TableName: 'EventsTable',
      Key: {
        id: sampleEvent.id,
      },
    });
    const responseFromDB = await ddbClient.send(command);

    expect(responseFromDB.Item).toMatchObject({
      ...sampleEvent,
      liveWaitingInputId,
    });
  });

  it('should list and sort items by a given attribute in asc order', async () => {
    const { repository } = setup();

    const event1 = EventMother.basic()
      .withId('37bfc238-6ef4-45a4-b874-9d8c2525ac5f')
      .withName('Event 1')
      .build();
    const event2 = EventMother.basic()
      .withId('7bb6463a-0fe0-4a25-a0c0-04fa14f66f5e')
      .withName('Event 2')
      .build();
    const event3 = EventMother.basic()
      .withId('a69fd9cb-a581-4797-a5c6-2e6bdfd18e70')
      .withName('Event 3')
      .build();
    await repository.createEvent(event3);
    await repository.createEvent(event1);
    await repository.createEvent(event2);

    const response = await repository.listEvents({
      limit: 10,
      sortBy: 'name',
    });

    expect(response.events).toMatchObject([event1, event2, event3]);
  });

  it('should list and sort items by a given attribute in desc order', async () => {
    const { repository } = setup();

    const event1 = EventMother.basic()
      .withId('37bfc238-6ef4-45a4-b874-9d8c2525ac5f')
      .withName('Event 1')
      .build();
    const event2 = EventMother.basic()
      .withId('7bb6463a-0fe0-4a25-a0c0-04fa14f66f5e')
      .withName('Event 2')
      .build();
    const event3 = EventMother.basic()
      .withId('a69fd9cb-a581-4797-a5c6-2e6bdfd18e70')
      .withName('Event 3')
      .build();
    await repository.createEvent(event3);
    await repository.createEvent(event1);
    await repository.createEvent(event2);

    const response = await repository.listEvents({
      limit: 10,
      sortBy: 'name',
      sortOrder: 'desc',
    });

    expect(response.events).toMatchObject([event3, event2, event1]);
  });

  it('should list and sort items by a given attribute in asc order and using pagination', async () => {
    const { repository } = setup();

    const event1 = EventMother.basic()
      .withId('37bfc238-6ef4-45a4-b874-9d8c2525ac5f')
      .withName('Event 1')
      .build();
    const event2 = EventMother.basic()
      .withId('7bb6463a-0fe0-4a25-a0c0-04fa14f66f5e')
      .withName('Event 2')
      .build();
    const event3 = EventMother.basic()
      .withId('a69fd9cb-a581-4797-a5c6-2e6bdfd18e70')
      .withName('Event 3')
      .build();
    await repository.createEvent(event3);
    await repository.createEvent(event1);
    await repository.createEvent(event2);

    const response = await repository.listEvents({
      limit: 2,
      sortBy: 'name',
    });

    expect(response.events).toMatchObject([event1, event2]);

    const response2 = await repository.listEvents({
      limit: 10,
      sortBy: 'name',
      nextToken: response.nextToken as string,
    });

    expect(response2.events).toMatchObject([event3]);
  });

  it('should update event destroyed time', async () => {
    const { ddbClient, repository } = setup();

    const sampleEvent = EventMother.basic().build();
    const destroyedTime = '2025-02-25T15:56:34.400Z';
    await repository.createEvent(sampleEvent);

    await repository.updateEventDestroyedTime(sampleEvent.id, destroyedTime);

    const command = new GetCommand({
      TableName: 'EventsTable',
      Key: {
        id: sampleEvent.id,
      },
    });
    const responseFromDB = await ddbClient.send(command);

    expect(responseFromDB.Item).toMatchObject({
      ...sampleEvent,
      destroyedTime,
    });
  });

  it('should return results matching name when specified', async () => {
    const { repository } = setup();

    const event1 = EventMother.basic()
      .withId('37bfc238-6ef4-45a4-b874-9d8c2525ac5f')
      .withName('Moto GP Race')
      .build();
    const event2 = EventMother.basic()
      .withId('a69fd9cb-a581-4797-a5c6-2e6bdfd18e70')
      .withName('CS:GO Tournament EUW 2025')
      .build();
    await repository.createEvent(event1);
    await repository.createEvent(event2);

    const response = await repository.listEvents({
      limit: 10,
      name: 'RaCe',
    });

    expect(response.events).toEqual([event1]);
  });

  it('should return results matching name when specified in any order', async () => {
    const { repository } = setup();

    const event1 = EventMother.basic()
      .withId('37bfc238-6ef4-45a4-b874-9d8c2525ac5f')
      .withName('Moto GP Race')
      .build();
    const event2 = EventMother.basic()
      .withId('7bb6463a-0fe0-4a25-a0c0-04fa14f66f5e')
      .withName('F1 Race car')
      .build();
    const event3 = EventMother.basic()
      .withId('a69fd9cb-a581-4797-a5c6-2e6bdfd18e70')
      .withName('CS:GO Tournament EUW 2025')
      .build();
    await repository.createEvent(event1);
    await repository.createEvent(event2);
    await repository.createEvent(event3);

    const response = await repository.listEvents({
      limit: 10,
      name: 'race',
      sortBy: 'name',
      sortOrder: 'desc',
    });

    expect(response.events).toMatchObject([event1, event2]);
  });

  it('should delete an event from DynamoDB', async () => {
    const { repository } = setup();

    const sampleEvent = EventMother.basic().build();
    await repository.createEvent(sampleEvent);

    const response = await repository.deleteEvent(sampleEvent.id);
    await expect(repository.getEvent(sampleEvent.id)).resolves.toBeUndefined();
    expect(response).toBeUndefined();
  });

  it('should throw a NotFoundError when deleting an item that does not exist', async () => {
    const { repository } = setup();

    await expect(repository.deleteEvent('non-existing-id')).rejects.toThrow(
      EventDoesNotExistError
    );
  });
});

const setup = () => {
  const dynamoDBClient = new DynamoDBClient({
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
    region: 'us-west-2',
  });

  const ddbClient = DynamoDBDocumentClient.from(dynamoDBClient);
  const createTable = async () => {
    await dynamoDBClient.send(
      new CreateTableCommand({
        TableName: 'EventsTable',
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
          { AttributeName: 'GSI-name-PK', AttributeType: 'S' },
          { AttributeName: 'name', AttributeType: 'S' },
          { AttributeName: 'GSI-onAirStartTime-PK', AttributeType: 'S' },
          { AttributeName: 'onAirStartTime', AttributeType: 'S' },
          { AttributeName: 'GSI-onAirEndTime-PK', AttributeType: 'S' },
          { AttributeName: 'onAirEndTime', AttributeType: 'S' },
          { AttributeName: 'GSI-status-PK', AttributeType: 'S' },
          { AttributeName: 'status', AttributeType: 'S' },
        ],
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
        GlobalSecondaryIndexes: [
          {
            IndexName: 'GSI-name',
            KeySchema: [
              { AttributeName: 'GSI-name-PK', KeyType: 'HASH' },
              { AttributeName: 'name', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
          {
            IndexName: 'GSI-onAirStartTime',
            KeySchema: [
              { AttributeName: 'GSI-onAirStartTime-PK', KeyType: 'HASH' },
              { AttributeName: 'onAirStartTime', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
          {
            IndexName: 'GSI-onAirEndTime',
            KeySchema: [
              { AttributeName: 'GSI-onAirEndTime-PK', KeyType: 'HASH' },
              { AttributeName: 'onAirEndTime', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
          {
            IndexName: 'GSI-status',
            KeySchema: [
              { AttributeName: 'GSI-status-PK', KeyType: 'HASH' },
              { AttributeName: 'status', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      })
    );
  };

  const deleteTable = async () => {
    await dynamoDBClient.send(
      new DeleteTableCommand({
        TableName: 'EventsTable',
      })
    );
  };

  const repository = new EventsDynamoDBRepository(ddbClient, 'EventsTable');

  return {
    ddbClient,
    repository,
    createTable,
    deleteTable,
  };
};
