import { createInjectionToken } from '@trackflix-live/di';
import { Source } from '@trackflix-live/types';
import { InputType } from '@aws-sdk/client-medialive';

export interface CreateChannelParameters {
  eventId: string;
  source: Source;
  packageChannelId: string;
  type: InputType;
}

export interface CreateChannelResponse {
  channelId: string;
  channelArn: string;
  inputId: string;
  waitingInputId: string;
}

export interface StartChannelParameters {
  eventId: string;
  channelId: string;
  onAirStartTime: string;
}

export interface LiveChannelsManager {
  createChannel(
    parameters: CreateChannelParameters
  ): Promise<CreateChannelResponse>;
  startChannel(parameters: StartChannelParameters): Promise<void>;
  stopChannel(channelId: string): Promise<void>;
  deleteChannel(channelId: string): Promise<void>;
  deleteInput(inputId: string): Promise<void>;
}
export const tokenLiveChannelsManager =
  createInjectionToken<LiveChannelsManager>('LiveChannelsManager');
