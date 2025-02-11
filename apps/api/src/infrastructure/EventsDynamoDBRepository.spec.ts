import { EventsDynamoDBRepository } from './EventsDynamoDBRepository';
import { Event, EventStatus } from '@trackflix-live/types';
import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

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
    const { sampleEvent, ddbClient } = setup();
    const repository = new EventsDynamoDBRepository(ddbClient, 'EventsTable');

    const response = await repository.createEvent(sampleEvent);

    const command = new GetCommand({
      TableName: 'EventsTable',
      Key: {
        id: sampleEvent.id,
      },
    });
    const responseFromDB = await ddbClient.send(command);

    expect(response).toBeUndefined();
    expect(responseFromDB.Item).toEqual({
      ...sampleEvent,
      onAirStartTime: sampleEvent.onAirStartTime.toISOString(),
      onAirEndTime: sampleEvent.onAirEndTime.toISOString(),
    });
  });

  it('should list events from DynamoDB', async () => {
    const { sampleEvent, ddbClient } = setup();
    const repository = new EventsDynamoDBRepository(ddbClient, 'EventsTable');

    await repository.createEvent(sampleEvent);

    const response = await repository.listEvents(10);

    expect(response.events).toEqual([
      {
        ...sampleEvent,
        onAirStartTime: sampleEvent.onAirStartTime.toISOString(),
        onAirEndTime: sampleEvent.onAirEndTime.toISOString(),
      },
    ]);
    expect(response.nextToken).toBeNull();
  });

  it('should return events in multiple requests if limit is less than the number of events', async () => {
    const { sampleEvent, ddbClient } = setup();
    const repository = new EventsDynamoDBRepository(ddbClient, 'EventsTable');

    await repository.createEvent(sampleEvent);
    await repository.createEvent({
      ...sampleEvent,
      id: '988de49c-14c8-4926-a40a-2f70c6aebc8b',
    });
    await repository.createEvent({
      ...sampleEvent,
      id: '988de49c-14c8-4926-a40a-2f70c6aebc8c',
    });

    const response = await repository.listEvents(1);

    expect(response.events.length).toBe(1);
    expect(response.nextToken).toBeDefined();

    const response2 = await repository.listEvents(
      3,
      response.nextToken as string
    );

    expect(response2.events.length).toBe(2);
    expect(response2.nextToken).toBeNull();
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

  const sampleEvent: Event = {
    id: '988de49c-14c8-4926-a40a-2f70c6aebc8a',
    name: 'Race car',
    description: 'A race car event.',
    onAirStartTime: new Date('2025-01-31T19:15:00+0000'),
    onAirEndTime: new Date('2025-01-31T20:00:00+0000'),
    source: {
      bucket: 'sample-bucket',
      key: 'sample-key',
    },
    status: EventStatus.CONFIRMED,
  };

  const createTable = async () => {
    await dynamoDBClient.send(
      new CreateTableCommand({
        TableName: 'EventsTable',
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
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

  return {
    ddbClient,
    sampleEvent,
    createTable,
    deleteTable,
  };
};
