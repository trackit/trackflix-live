import { EventBridgeEvent } from 'aws-lambda';
import { HandleMediaLiveChannelStateChangeAdapter } from './handleMediaLiveChannelStateChange.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

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
