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
}
