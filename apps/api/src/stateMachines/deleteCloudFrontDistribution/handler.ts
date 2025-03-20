import { DeleteCloudFrontDistributionAdapter } from './deleteCloudFrontDistribution.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new DeleteCloudFrontDistributionAdapter();

export const main = async (params: {
  input: {
    eventId: string;
    cdnDistributionId: string;
  };
}): Promise<{
  eventId: string;
}> => adapter.handle(params);
