import { EventBridgeEvent } from 'aws-lambda';
import { HandleLiveChannelStateChangeUseCaseImpl } from '@trackflix-live/api-events';
import { HandleMediaLiveChannelStateChangeAdapter } from './handleMediaLiveChannelStateChange.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const useCase = new HandleLiveChannelStateChangeUseCaseImpl();

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
