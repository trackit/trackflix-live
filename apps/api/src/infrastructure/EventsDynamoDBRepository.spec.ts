import { EventsDynamoDBRepository } from './EventsDynamoDBRepository';
import { Event, EventStatus } from '@trackflix-live/types';
import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

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
    ddbClient,
    sampleEvent,
    createTable,
    deleteTable,
  };
};
