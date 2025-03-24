import { createInjectionToken } from '@trackflix-live/di';

export interface CreateCDNDistributionResponse {
  cdnDistributionId: string;
}

export interface CDNDistributionsManager {
  createDistribution(): Promise<CreateCDNDistributionResponse>;
  deleteDistribution(cdnDistributionId: string): Promise<void>;
  createOrigin(eventId: string, cdnDistributionId: string, packageDomainName: string): Promise<void>;
  deleteOrigin(eventId: string, cdnDistributionId: string): Promise<void>;
}
export const tokenCDNDistributionsManager =
  createInjectionToken<CDNDistributionsManager>('CDNDistributionsManager');
