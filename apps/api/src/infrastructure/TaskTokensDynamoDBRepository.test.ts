import { EventsDynamoDBRepository } from './EventsDynamoDBRepository';
import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { TaskTokensDynamoDBRepository } from './TaskTokensDynamoDBRepository';

describe('TaskTokensDynamoDBRepository', () => {
  beforeEach(async () => {
    const { createTable } = setup();
    await createTable();
  });

  afterEach(async () => {
    const { deleteTable } = setup();
    await deleteTable();
  });

  describe('createTaskToken', () => {
    it('should create a task token', async () => {
      const { ddbClient, repository, tableName } = setup();
      const channelArn =
        'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
      const taskToken = 'sample_task_token';
      const output = {
        test: '123456',
      };
      const expectedStatus = 'CREATED' as const;

      await repository.createTaskToken({
        channelArn,
        taskToken,
        output,
        expectedStatus,
      });

      const databaseResponse = await ddbClient.send(
        new GetCommand({
          TableName: tableName,
          Key: {
            key: 'arn:aws:medialive:us-west-2:000000000000:channel:8626488#CREATED',
          },
        })
      );

      expect(databaseResponse.Item).toEqual({
        key: 'arn:aws:medialive:us-west-2:000000000000:channel:8626488#CREATED',
        output,
        taskToken,
      });
    });
  });

  describe('consumeTaskToken', () => {
    it('should do nothing if task token does not exist', async () => {
      const { repository } = setup();
      const channelArn =
        'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
      const expectedStatus = 'CREATED' as const;

      const response = await repository.consumeTaskToken({
        channelArn,
        expectedStatus,
      });

      expect(response).toBeUndefined();
    });

    it('should return task token', async () => {
      const { repository } = setup();
      const channelArn =
        'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
      const taskToken = 'sample_task_token';
      const output = {
        test: '123456',
      };
      const expectedStatus = 'CREATED' as const;

      await repository.createTaskToken({
        channelArn,
        taskToken,
        output,
        expectedStatus,
      });

      const response = await repository.consumeTaskToken({
        channelArn,
        expectedStatus,
      });

      expect(response).toEqual({
        taskToken,
        output,
      });
    });

    it('should delete task token', async () => {
      const { repository, ddbClient, tableName } = setup();
      const channelArn =
        'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
      const taskToken = 'sample_task_token';
      const output = {
        test: '123456',
      };
      const expectedStatus = 'CREATED' as const;

      await repository.createTaskToken({
        channelArn,
        taskToken,
        output,
        expectedStatus,
      });

      await repository.consumeTaskToken({
        channelArn,
        expectedStatus,
      });

      const databaseResponse = await ddbClient.send(
        new GetCommand({
          TableName: tableName,
          Key: {
            key: 'arn:aws:medialive:us-west-2:000000000000:channel:8626488#CREATED',
          },
        })
      );

      expect(databaseResponse.Item).toBeUndefined();
    });
  });
});

const setup = () => {
  const tableName = 'TaskTokensTable';
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
        TableName: tableName,
        AttributeDefinitions: [{ AttributeName: 'key', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'key', KeyType: 'HASH' }],
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
        TableName: tableName,
      })
    );
  };

  const repository = new TaskTokensDynamoDBRepository({
    client: ddbClient,
    tableName,
  });

  return {
    ddbClient,
    repository,
    tableName,
    createTable,
    deleteTable,
  };
};
