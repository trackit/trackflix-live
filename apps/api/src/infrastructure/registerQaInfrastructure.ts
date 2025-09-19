import { register } from '@trackflix-live/di';
import {
  tokenEventSchedulerStart,
  tokenEventSchedulerStop,
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenLiveChannelsManager,
  tokenPackageChannelsManager,
  tokenTaskTokensRepository,
  tokenTransmissionsManager,
  tokenEventSchedulerDelete,
  tokenAssetsService,
  tokenCDNDistributionsManager,
} from '@trackflix-live/api-events';
import { EventsIotUpdateSender } from './EventsIotUpdateSender';
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane';
import { IoTClient } from '@aws-sdk/client-iot';
import { EventBridgeScheduler } from './EventBridgeScheduler';
import { SchedulerClient } from '@aws-sdk/client-scheduler';
import { EventsDynamoDBRepository } from './EventsDynamoDBRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { TaskTokensDynamoDBRepository } from './TaskTokensDynamoDBRepository';
import { TransmissionsManagerSfn } from './TransmissionsManagerSfn';
import { SFNClient } from '@aws-sdk/client-sfn';
import { S3Client } from '@aws-sdk/client-s3';
import { S3AssetsService } from './S3AssetsService';
import { QaLiveChannelsManager } from './QaLiveChannelsManager';
import { QaPackageChannelsManager } from './QaPackageChannelsManager';
import { QaCdnDistributionsManager } from './QaCdnDistributionsManager';
import { SQSClient } from '@aws-sdk/client-sqs';

export const registerQaInfrastructure = () => {
  const schedulerClient = new SchedulerClient();
  const iotDataPlaneClient = new IoTDataPlaneClient();
  const iotClient = new IoTClient();
  const dynamoClient = new DynamoDBClient();
  const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoClient);
  const sfnClient = new SFNClient();
  const s3Client = new S3Client();
  const sqsClient = new SQSClient();

  register(tokenAssetsService, {
    useFactory: () => {
      return new S3AssetsService(s3Client);
    },
  });
  register(tokenEventSchedulerDelete, {
    useFactory: () => {
      return new EventBridgeScheduler({
        client: schedulerClient,
        target: '',
        roleArn: '',
      });
    },
  });
  register(tokenEventSchedulerStart, {
    useFactory: () => {
      return new EventBridgeScheduler({
        client: schedulerClient,
        target: process.env.START_TX_LAMBDA || '',
        roleArn: process.env.ROLE_ARN || '',
      });
    },
  });
  register(tokenEventSchedulerStop, {
    useFactory: () => {
      return new EventBridgeScheduler({
        client: schedulerClient,
        target: process.env.STOP_TX_LAMBDA || '',
        roleArn: process.env.ROLE_ARN || '',
      });
    },
  });
  register(tokenEventsRepository, {
    useFactory: () => {
      return new EventsDynamoDBRepository(
        dynamoDocumentClient,
        process.env.EVENTS_TABLE || ''
      );
    },
  });
  register(tokenEventUpdateSender, {
    useFactory: () => {
      return new EventsIotUpdateSender({
        dataPlaneClient: iotDataPlaneClient,
        client: iotClient,
        iotTopicName: process.env.IOT_TOPIC || '',
        iotPolicy: process.env.IOT_POLICY || '',
      });
    },
  });
  register(tokenLiveChannelsManager, {
    useFactory: () =>
      new QaLiveChannelsManager({
        sqsClient,
        queueUrl: process.env.QA_LIVE_CHANNEL_QUEUE_URL || '',
        s3Client,
        bucketName: process.env.QA_LOGS_BUCKET || '',
      }),
  });
  register(tokenPackageChannelsManager, {
    useFactory: () =>
      new QaPackageChannelsManager({
        s3Client,
        bucketName: process.env.QA_LOGS_BUCKET || '',
      }),
  });
  register(tokenCDNDistributionsManager, {
    useFactory: () =>
      new QaCdnDistributionsManager({
        s3Client,
        bucketName: process.env.QA_LOGS_BUCKET || '',
      }),
  });
  register(tokenTaskTokensRepository, {
    useFactory: () => {
      return new TaskTokensDynamoDBRepository({
        client: dynamoDocumentClient,
        tableName: process.env.TASK_TOKENS_TABLE || '',
      });
    },
  });
  register(tokenTransmissionsManager, {
    useFactory: () => {
      return new TransmissionsManagerSfn({
        client: sfnClient,
        startTransmissionStateMachineArn:
          process.env.START_TX_STATE_MACHINE || '',
        stopTransmissionStateMachineArn:
          process.env.STOP_TX_STATE_MACHINE || '',
      });
    },
  });
};
