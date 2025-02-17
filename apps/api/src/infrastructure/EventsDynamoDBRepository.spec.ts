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
    expect(responseFromDB.Item).toEqual({
      ...sampleEvent,
      onAirStartTime: sampleEvent.onAirStartTime.toISOString(),
      onAirEndTime: sampleEvent.onAirEndTime.toISOString(),
    });
  });

  it('should list events from DynamoDB', async () => {
    const { repository } = setup();

    const sampleEvent = EventMother.basic().build();
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
    const { repository } = setup();

    const sampleEvent = EventMother.basic().build();
    await repository.createEvent(sampleEvent);

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

  const repository = new EventsDynamoDBRepository(ddbClient, 'EventsTable');

  return {
    ddbClient,
    repository,
    createTable,
    deleteTable,
  };
};
