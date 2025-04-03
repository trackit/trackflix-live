import { createInjectionToken } from '@trackflix-live/di';
import { EventEndpoint } from '@trackflix-live/types';

export interface CreateCDNOriginParameters {
  eventId: string;
  packageDomainName: string;
  endpoints: EventEndpoint[];
  cdnDistributionId: string;
}

export interface CreateCDNOriginResponse {
  eventId: string;
  endpoints: EventEndpoint[];
}

export interface CDNDistributionsManager {
  createOrigin(
    parameters: CreateCDNOriginParameters
  ): Promise<CreateCDNOriginResponse>;
  deleteOrigin(eventId: string): Promise<void>;
}
export const tokenCDNDistributionsManager =
  createInjectionToken<CDNDistributionsManager>('CDNDistributionsManager');
