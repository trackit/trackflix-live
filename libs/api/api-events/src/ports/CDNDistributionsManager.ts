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

export interface DeleteCDNOriginParameters {
  eventId: string;
  cdnDistributionId: string;
}

export interface CDNDistributionsManager {
  createOrigin(
    parameters: CreateCDNOriginParameters
  ): Promise<CreateCDNOriginResponse>;
  deleteOrigin(
    parameters: DeleteCDNOriginParameters
  ): Promise<void>;
}
export const tokenCDNDistributionsManager =
  createInjectionToken<CDNDistributionsManager>('CDNDistributionsManager');
