import {
  CDNDistributionsManager,
  CreateCDNDistributionResponse,
} from '../ports/CDNDistributionsManager';
import { createInjectionToken } from '@trackflix-live/di';

export class CDNDistributionsManagerFake implements CDNDistributionsManager {
  private cdnDistributionId = 'E2QWRUHAPVYC32';

  public readonly createdDistributions: { eventId: string; packageDomainName: string }[] = [];

  public readonly deletedDistributions: string[] = [];

  public async createDistribution(
    eventId: string,
    packageDomainName: string
  ): Promise<CreateCDNDistributionResponse> {
    this.createdDistributions.push({ eventId, packageDomainName });
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
}

export const tokenCDNDistributionsManagerFake =
  createInjectionToken<CDNDistributionsManagerFake>(
    'CDNDistributionsManagerFake',
    {
      useClass: CDNDistributionsManagerFake,
    }
  );
