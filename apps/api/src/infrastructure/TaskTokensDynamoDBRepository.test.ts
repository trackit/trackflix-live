import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { TaskTokensDynamoDBRepository } from './TaskTokensDynamoDBRepository';

describe('TaskTokensDynamoDBRepository', () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);
  const tableName = 'TaskTokensTable';
  const repository = new TaskTokensDynamoDBRepository({
    client: ddbMock as unknown as DynamoDBDocumentClient,
    tableName,
  });

  beforeEach(() => {
    ddbMock.reset();
  });

  describe('createTaskToken', () => {
    it('should create a task token', async () => {
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

      expect(ddbMock.commandCalls(PutCommand)).toHaveLength(1);
      expect(ddbMock.commandCalls(PutCommand)[0].args[0].input).toEqual({
        TableName: tableName,
        Item: {
          key: 'arn:aws:medialive:us-west-2:000000000000:channel:8626488#CREATED',
          output,
          taskToken,
        },
      });
    });
  });

  describe('consumeTaskToken', () => {
    it('should do nothing if task token does not exist', async () => {
      const channelArn =
        'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
      const expectedStatus = 'CREATED' as const;

      ddbMock.on(GetCommand).resolves({
        Item: undefined,
      });

      const response = await repository.consumeTaskToken({
        channelArn,
        expectedStatus,
      });

      expect(response).toBeUndefined();
    });

    it('should return task token', async () => {
      const channelArn =
        'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
      const taskToken = 'sample_task_token';
      const output = {
        test: '123456',
      };
      const expectedStatus = 'CREATED' as const;

      ddbMock.on(GetCommand).resolves({
        Item: {
          key: 'arn:aws:medialive:us-west-2:000000000000:channel:8626488#CREATED',
          output,
          taskToken,
        },
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
      const channelArn =
        'arn:aws:medialive:us-west-2:000000000000:channel:8626488';
      const taskToken = 'sample_task_token';
      const output = {
        test: '123456',
      };
      const expectedStatus = 'CREATED' as const;

      ddbMock.on(GetCommand).resolves({
        Item: {
          key: 'arn:aws:medialive:us-west-2:000000000000:channel:8626488#CREATED',
          output,
          taskToken,
        },
      });

      await repository.consumeTaskToken({
        channelArn,
        expectedStatus,
      });

      expect(ddbMock.commandCalls(DeleteCommand)).toHaveLength(1);
      expect(ddbMock.commandCalls(DeleteCommand)[0].args[0].input).toEqual({
        TableName: tableName,
        Key: {
          key: 'arn:aws:medialive:us-west-2:000000000000:channel:8626488#CREATED',
        },
      });
    });
  });
});
