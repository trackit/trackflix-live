import { tokenCDNDistributionsManager } from '../../ports';
import { createInjectionToken, inject } from '@trackflix-live/di';
import { CreateCDNDistributionResponse } from '../../ports';

export interface CreateCDNDistributionUseCase {
  createCDNDistribution(): Promise<CreateCDNDistributionResponse>;
}

export class CreateCDNDistributionUseCaseImpl implements CreateCDNDistributionUseCase {
  private readonly CDNDistributionsManager = inject(tokenCDNDistributionsManager);

  public async createCDNDistribution(): Promise<CreateCDNDistributionResponse> {
    const cdnDistribution = await this.CDNDistributionsManager.createDistribution();

    return {
      cdnDistributionId: cdnDistribution.cdnDistributionId,
    };
  }
}

export const tokenCreateCDNDistributionUseCase =
  createInjectionToken<CreateCDNDistributionUseCase>('CreateCDNDistributionUseCase', {
    useClass: CreateCDNDistributionUseCaseImpl,
  });
