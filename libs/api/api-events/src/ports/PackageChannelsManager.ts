import { EventEndpoint } from '@trackflix-live/types';
import { createInjectionToken } from 'di';

export interface CreatePackageChannelResponse {
  channelId: string;
  endpoints: EventEndpoint[];
}

export interface PackageChannelsManager {
  createChannel(eventId: string): Promise<CreatePackageChannelResponse>;
  deleteChannel(channelId: string): Promise<void>;
}
export const tokenPackageChannelsManager =
  createInjectionToken<PackageChannelsManager>('PackageChannelsManager');
