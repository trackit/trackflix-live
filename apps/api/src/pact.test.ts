import * as path from 'path';
import { Verifier } from '@pact-foundation/pact';
import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { EventsDynamoDBRepository } from './infrastructure/EventsDynamoDBRepository';
import { EventMother } from '@trackflix-live/types';

describe('Pact Verification', () => {
  it('validates the expectations of ApiClient', async () => {
    const { tableExists, createTable, deleteTable, repository } = setup();

    if (await tableExists()) {
      await deleteTable();
    }
    await createTable();

    const output = await new Verifier({
      logLevel: 'info',
      providerBaseUrl: 'http://localhost:3000',
      provider: 'RestApi',
      providerVersion: '1.0.0',
      pactUrls: [path.resolve(__dirname, '..', '..', '..', 'pacts')],
      stateHandlers: {
        'events exist': async () => {
          await repository.createEvent(
            EventMother.basic().withId('1').withName('My first event').build()
          );
          await repository.createEvent(
            EventMother.basic().withId('2').withName('My second event').build()
          );
          await repository.createEvent(
            EventMother.basic().withId('3').withName('My third event').build()
          );
        },
        'event with id 10 exists': async () => {
          await repository.createEvent(
            EventMother.basic().withId('10').withName('My first event').build()
          );
        },
      },
    }).verifyProvider();
    console.log(output);
  }, 20000);
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

  const tableExists = async () => {
    try {
      await dynamoDBClient.send(
        new DescribeTableCommand({
          TableName: 'EventsTable',
        })
      );
      return true;
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        return false;
      }
      throw e;
    }
  };

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
    tableExists,
  };
};
