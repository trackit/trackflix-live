import {
  CDNDistributionsManager,
  CreateCDNDistributionResponse,
} from '../ports/CDNDistributionsManager';
import { createInjectionToken } from '@trackflix-live/di';

export class CDNDistributionsManagerFake implements CDNDistributionsManager {
  private cdnDistributionId = 'E2QWRUHAPVYC32';

  public readonly createdDistributions: string[] = [];

  public readonly deletedDistributions: string[] = [];

  public readonly createdOrigins: { eventId: string; cdnDistributionId: string; packageDomainName: string }[] = [];

  public readonly deletedOrigins: { eventId: string; cdnDistributionId: string }[] = [];

  public async createDistribution(): Promise<CreateCDNDistributionResponse> {
    this.createdDistributions.push(this.cdnDistributionId);
    return {
      cdnDistributionId: this.cdnDistributionId,
    };
  }

  public setCreateDistributionResponse(response: CreateCDNDistributionResponse) {
    this.cdnDistributionId = response.cdnDistributionId;
  }

  public async deleteDistribution(cdnDistributionId: string): Promise<void> {
    this.deletedDistributions.push(cdnDistributionId);
  }

  public async createOrigin(
    eventId: string,
    cdnDistributionId: string,
    packageDomainName: string
  ): Promise<void> {
    this.createdOrigins.push({ eventId, cdnDistributionId, packageDomainName });
  }

  public async deleteOrigin(eventId: string, cdnDistributionId: string): Promise<void> {
    this.deletedOrigins.push({eventId, cdnDistributionId});
  }
}

export const tokenCDNDistributionsManagerFake =
  createInjectionToken<CDNDistributionsManagerFake>(
    'CDNDistributionsManagerFake',
    {
      useClass: CDNDistributionsManagerFake,
    }
  );
