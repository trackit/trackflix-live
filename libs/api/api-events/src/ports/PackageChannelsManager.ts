import { EventEndpoint } from '@trackflix-live/types';

export interface CreatePackageChannelResponse {
  channelId: string;
  endpoints: EventEndpoint[];
}

export interface PackageChannelsManager {
  createChannel(eventId: string): Promise<CreatePackageChannelResponse>;
  deleteChannel(channelId: string): Promise<void>;
}
