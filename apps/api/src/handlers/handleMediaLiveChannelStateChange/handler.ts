import { EventBridgeEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { SendTaskSuccessCommand, SFNClient } from '@aws-sdk/client-sfn';

export const main = async (
  event: EventBridgeEvent<
    'MediaLive Channel State Change',
    {
      channel_arn: string;
      state: 'CREATED' | 'RUNNING' | 'STOPPING' | 'STOPPED';
    }
  >
): Promise<void> => {
  const dynamoClient = new DynamoDBClient();
  const documentClient = DynamoDBDocumentClient.from(dynamoClient);

  const item = await documentClient.send(
    new GetCommand({
      TableName: process.env.TASK_TOKENS_TABLE,
      Key: {
        key: `${event.detail.channel_arn}#${event.detail.state}`,
      },
    })
  );
  if (item.Item === undefined) {
    return;
  }

  const sfnClient = new SFNClient();
  await sfnClient.send(
    new SendTaskSuccessCommand({
      taskToken: item.Item.taskToken,
      output: JSON.stringify(item.Item.output),
    })
  );

  await documentClient.send(
    new DeleteCommand({
      TableName: process.env.TASK_TOKENS_TABLE,
      Key: {
        key: `${event.detail.channel_arn}#${event.detail.state}`,
      },
    })
  );
};
