import { createCloudFrontDistributionAdapter } from './createCloudFrontDistribution.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new createCloudFrontDistributionAdapter();

export const main = async (params: {
  input: {
    eventId: string;
    packageDomainName: string;
  };
}): Promise<{ eventId: string; cdnDistributionId: string }> =>
  adapter.handle(params);
