import { DeleteCloudFrontDistributionAdapter } from './deleteCloudFrontDistribution.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new DeleteCloudFrontDistributionAdapter();

export const main = async (params: {
  input: {
    cdnDistributionId: string;
  };
}): Promise<void> => adapter.handle(params);
