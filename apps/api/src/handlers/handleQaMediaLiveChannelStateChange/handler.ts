import { SQSEvent } from 'aws-lambda';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient();

const { HANDLE_MEDIA_LIVE_CHANNEL_STATE_CHANGE_LAMBDA_NAME } = process.env;

if (HANDLE_MEDIA_LIVE_CHANNEL_STATE_CHANGE_LAMBDA_NAME == undefined) {
  throw new Error(
    'HANDLE_MEDIA_LIVE_CHANNEL_STATE_CHANGE_LAMBDA_NAME not set.'
  );
}

export const main = async (event: SQSEvent): Promise<void> => {
  await Promise.all(
    event.Records.map(async (record) => {
      const body = JSON.parse(record.body) as {
        channelArn: string;
        state: string;
      };

      console.log(`Sending fake event: ${body.channelArn} -> ${body.state}`);

      const fakeEvent = {
        'detail-type': 'MediaLive Channel State Change',
        detail: {
          channel_arn: body.channelArn,
          state: body.state,
        },
      };

      await lambdaClient.send(
        new InvokeCommand({
          FunctionName: HANDLE_MEDIA_LIVE_CHANNEL_STATE_CHANGE_LAMBDA_NAME,
          Payload: JSON.stringify(fakeEvent),
        })
      );
    })
  );
};
