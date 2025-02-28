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
} from '@trackflix-live/api-events';
import { EventsIotUpdateSender } from './EventsIotUpdateSender';
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane';
import { IoTClient } from '@aws-sdk/client-iot';
import { EventBridgeScheduler } from './EventBridgeScheduler';
import { SchedulerClient } from '@aws-sdk/client-scheduler';
import { EventsDynamoDBRepository } from './EventsDynamoDBRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { MediaLiveChannelsManager } from './MediaLiveChannelsManager';
import { MediaLiveClient } from '@aws-sdk/client-medialive';
import { MediaPackageChannelsManager } from './MediaPackageChannelsManager';
import { MediaPackageClient } from '@aws-sdk/client-mediapackage';
import { TaskTokensDynamoDBRepository } from './TaskTokensDynamoDBRepository';
import { TransmissionsManagerSfn } from './TransmissionsManagerSfn';
import { SFNClient } from '@aws-sdk/client-sfn';

export const registerProductionInfrastructure = () => {
  const schedulerClient = new SchedulerClient();
  const iotDataPlaneClient = new IoTDataPlaneClient();
  const iotClient = new IoTClient();
  const dynamoClient = new DynamoDBClient();
  const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoClient);
  const mediaLiveClient = new MediaLiveClient();
  const mediaPackageClient = new MediaPackageClient();
  const sfnClient = new SFNClient();

  register(tokenEventSchedulerDelete, {
    useFactory: () => {
      return new EventBridgeScheduler({
        client: schedulerClient,
        target: process.env.DELETE_TX_LAMBDA || '',
        roleArn: process.env.ROLE_ARN || '',
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
    useFactory: () => {
      return new MediaLiveChannelsManager({
        client: mediaLiveClient,
        mediaLiveRoleArn: process.env.MEDIA_LIVE_ROLE || '',
        waitingSource: process.env.WAITING_SOURCE || '',
      });
    },
  });
  register(tokenPackageChannelsManager, {
    useFactory: () => {
      return new MediaPackageChannelsManager({ client: mediaPackageClient });
    },
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
