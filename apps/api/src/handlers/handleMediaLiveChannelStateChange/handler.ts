import { EventBridgeEvent } from 'aws-lambda';
import { HandleMediaLiveChannelStateChangeAdapter } from './handleMediaLiveChannelStateChange.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { registerQaInfrastructure } from '../../infrastructure/registerQaInfrastructure';

const infrastructure =
  process.env.QA_MODE !== 'true'
    ? registerProductionInfrastructure
    : registerQaInfrastructure;
infrastructure();

const adapter = new HandleMediaLiveChannelStateChangeAdapter();

export const main = async (
  event: EventBridgeEvent<
    'MediaLive Channel State Change',
    {
      channel_arn: string;
      state: 'CREATED' | 'RUNNING' | 'STOPPING' | 'STOPPED';
    }
  >
): Promise<void> => adapter.handle(event);
