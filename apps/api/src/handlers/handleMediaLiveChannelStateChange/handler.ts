import { EventBridgeEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SFNClient } from '@aws-sdk/client-sfn';
import { HandleLiveChannelStateChangeUseCaseImpl } from '@trackflix-live/api-events';
import { TaskTokensDynamoDBRepository } from '../../infrastructure/TaskTokensDynamoDBRepository';
import { TransmissionsManagerSfn } from '../../infrastructure/TransmissionsManagerSfn';
import { HandleMediaLiveChannelStateChangeAdapter } from './handleMediaLiveChannelStateChange.adapter';

const dynamoDbClient = new DynamoDBClient();
const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

const taskTokensRepository = new TaskTokensDynamoDBRepository({
  client: documentClient,
  tableName: process.env.TASK_TOKENS_TABLE!,
});

const transmissionsManager = new TransmissionsManagerSfn({
  client: new SFNClient(),
  startTransmissionStateMachineArn: process.env['START_TX_STATE_MACHINE']!,
  stopTransmissionStateMachineArn: process.env['STOP_TX_STATE_MACHINE']!,
});

const useCase = new HandleLiveChannelStateChangeUseCaseImpl({
  taskTokensRepository,
  transmissionsManager,
});

const adapter = new HandleMediaLiveChannelStateChangeAdapter({
  useCase,
});

export const main = async (
  event: EventBridgeEvent<
    'MediaLive Channel State Change',
    {
      channel_arn: string;
      state: 'CREATED' | 'RUNNING' | 'STOPPING' | 'STOPPED';
    }
  >
): Promise<void> => adapter.handle(event);
