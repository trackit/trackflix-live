import {
  MediaLiveClient,
  StartChannelCommand,
} from '@aws-sdk/client-medialive';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

export const main = async ({
  input: { eventId, packageChannelId, liveChannelId, liveChannelArn },
  taskToken,
}: {
  input: {
    eventId: string;
    packageChannelId: string;
    liveChannelId: string;
    liveChannelArn: string;
  };
  taskToken: string;
}): Promise<{
  eventId: string;
  packageChannelId: string;
  liveChannelId: string;
  liveChannelArn: string;
}> => {
  const mediaLiveClient = new MediaLiveClient();

  await mediaLiveClient.send(
    new StartChannelCommand({
      ChannelId: liveChannelId,
    })
  );

  const dynamoClient = new DynamoDBClient();
  const documentClient = DynamoDBDocumentClient.from(dynamoClient);

  await documentClient.send(
    new PutCommand({
      TableName: process.env.TASK_TOKENS_TABLE,
      Item: {
        key: `${liveChannelArn}#RUNNING`,
        taskToken: taskToken,
        output: {
          eventId,
          packageChannelId,
          liveChannelId,
          liveChannelArn,
        },
      },
    })
  );

  return {
    eventId,
    packageChannelId,
    liveChannelId,
    liveChannelArn,
  };
};
