import { EventsDynamoDBRepository } from './EventsDynamoDBRepository';
import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { EventMother } from '@trackflix-live/types';

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
    const { ddbClient } = setup();
    const repository = new EventsDynamoDBRepository(ddbClient, 'EventsTable');

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

  it('should get an event from DynamoDB', async () => {
    const { ddbClient } = setup();
    const repository = new EventsDynamoDBRepository(ddbClient, 'EventsTable');

    const sampleEvent = EventMother.basic().build();
    await repository.createEvent(sampleEvent);

    const command = new GetCommand({
      TableName: 'EventsTable',
      Key: {
        id: sampleEvent.id,
      },
    });
    await ddbClient.send(command);

    const response = await repository.getEvent(sampleEvent.id);

    expect(response).toEqual(sampleEvent);
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
    createTable,
    deleteTable,
  };
};
