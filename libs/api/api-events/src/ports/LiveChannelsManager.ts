export interface CreateChannelParameters {
  eventId: string;
  source: string;
  packageChannelId: string;
}

export interface CreateChannelResponse {
  channelId: string;
  channelArn: string;
}

export interface LiveChannelsManager {
  createChannel(
    parameters: CreateChannelParameters
  ): Promise<CreateChannelResponse>;
  startChannel(channelId: string): Promise<void>;
  stopChannel(channelId: string): Promise<void>;
  deleteChannel(channelId: string): Promise<void>;
  deleteInput(inputId: string): Promise<void>;
}
