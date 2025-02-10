import {
  MediaLiveClient,
  StartChannelCommand,
} from '@aws-sdk/client-medialive';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

export const main = async ({
  input: {
    eventId,
    mediaPackageChannelId,
    mediaLiveChannelId,
    mediaLiveChannelArn,
  },
  taskToken,
}: {
  input: {
    eventId: string;
    mediaPackageChannelId: string;
    mediaLiveChannelId: string;
    mediaLiveChannelArn: string;
  };
  taskToken: string;
}): Promise<{
  eventId: string;
  mediaPackageChannelId: string;
  mediaLiveChannelId: string;
  mediaLiveChannelArn: string;
}> => {
  const mediaLiveClient = new MediaLiveClient();

  await mediaLiveClient.send(
    new StartChannelCommand({
      ChannelId: mediaLiveChannelId,
    })
  );

  const dynamoClient = new DynamoDBClient();
  const documentClient = DynamoDBDocumentClient.from(dynamoClient);

  await documentClient.send(
    new PutCommand({
      TableName: process.env.TASK_TOKENS_TABLE,
      Item: {
        key: `${mediaLiveChannelArn}#RUNNING`,
        taskToken: taskToken,
        output: {
          eventId,
          mediaPackageChannelId,
          mediaLiveChannelArn,
        },
      },
    })
  );

  return {
    eventId,
    mediaPackageChannelId,
    mediaLiveChannelId,
    mediaLiveChannelArn,
  };
};
