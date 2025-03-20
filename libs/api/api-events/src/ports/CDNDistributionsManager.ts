import { createInjectionToken } from '@trackflix-live/di';

export interface CreateCDNDistributionResponse {
  cdnDistributionId: string;
}

export interface CDNDistributionsManager {
  createDistribution(eventId: string, packageDomainName: string): Promise<CreateCDNDistributionResponse>;
  deleteDistribution(cdnDistributionId: string): Promise<void>;
}
export const tokenCDNDistributionsManager =
  createInjectionToken<CDNDistributionsManager>('CDNDistributionsManager');
