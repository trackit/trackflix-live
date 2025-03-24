import { CreateCloudFrontDistributionAdapter } from './createCloudFrontDistribution.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new CreateCloudFrontDistributionAdapter();

export const main = async (): Promise<{ cdnDistributionId: string }> =>
  adapter.handle();
