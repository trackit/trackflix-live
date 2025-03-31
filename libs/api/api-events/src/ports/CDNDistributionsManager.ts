import { createInjectionToken } from '@trackflix-live/di';

export interface CreateCDNOriginParameters {
  eventId: string;
  liveChannelArn: string;
  liveChannelId: string;
  packageChannelId: string;
  packageDomainName: string;
}

export interface CreateCDNOriginResponse {
  eventId: string;
  liveChannelArn: string;
  liveChannelId: string;
  packageChannelId: string;
}

export interface CDNDistributionsManager {
  createOrigin(
    parameters: CreateCDNOriginParameters
  ): Promise<CreateCDNOriginResponse>;
  deleteOrigin(eventId: string): Promise<void>;
}
export const tokenCDNDistributionsManager =
  createInjectionToken<CDNDistributionsManager>('CDNDistributionsManager');
