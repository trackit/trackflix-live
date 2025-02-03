import { EventsDynamoDBRepository } from './EventsDynamoDBRepository';
import { Event, EventStatus } from '@trackflix-live/types';
import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';

beforeAll(async () => {
  const { createTable } = setup();
  await createTable();
});

afterAll(async () => {
  const { deleteTable } = setup();
  await deleteTable();
});

describe('EventsDynamoDBRepository', () => {
  it('should create an event in DynamoDB', async () => {
    const { dynamoDBClient, sampleEvent } = setup();
    const repository = new EventsDynamoDBRepository(
      dynamoDBClient,
      'EventsTable'
    );

    const response = await repository.createEvent(sampleEvent);

    const fromDBParams = {
      TableName: 'EventsTable',
      Key: {
        id: { S: sampleEvent.id },
      },
    };
    const responseFromDB = await dynamoDBClient.send(
      new GetItemCommand(fromDBParams)
    );

    expect(response).toBeUndefined();
    expect(responseFromDB.Item).toEqual({
      id: { S: sampleEvent.id },
      name: { S: sampleEvent.name },
      description: { S: sampleEvent.description },
      onAirStartTime: { S: sampleEvent.onAirStartTime.toISOString() },
      onAirEndTime: { S: sampleEvent.onAirEndTime.toISOString() },
      source: {
        M: {
          bucket: { S: sampleEvent.source.bucket },
          key: { S: sampleEvent.source.key },
        },
      },
      status: { S: sampleEvent.status },
    });
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

  const sampleEvent: Event = {
    id: '988de49c-14c8-4926-a40a-2f70c6aebc8f',
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
    dynamoDBClient,
    sampleEvent,
    createTable,
    deleteTable,
  };
};
