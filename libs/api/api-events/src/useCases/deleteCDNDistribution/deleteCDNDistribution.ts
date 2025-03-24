import {
  tokenCDNDistributionsManager,
} from '../../ports';
import { createInjectionToken, inject } from '@trackflix-live/di';

export interface DeleteCDNDistributionParameters {
  cdnDistributionId: string;
}

export interface DeleteCDNDistributionUseCase {
  deleteCDNDistribution(params: DeleteCDNDistributionParameters): Promise<void>;
}

export class DeleteCDNDistributionUseCaseImpl
  implements DeleteCDNDistributionUseCase
{


  private readonly cdnDistributionsManager = inject(tokenCDNDistributionsManager);

  public async deleteCDNDistribution({
    cdnDistributionId,
  }: DeleteCDNDistributionParameters): Promise<void> {
    await this.cdnDistributionsManager.deleteDistribution(cdnDistributionId);
  }
}

export const tokenDeleteCDNDistributionUseCase =
  createInjectionToken<DeleteCDNDistributionUseCase>(
    'DeleteCDNDistributionUseCase',
    {
      useClass: DeleteCDNDistributionUseCaseImpl,
    }
  );
