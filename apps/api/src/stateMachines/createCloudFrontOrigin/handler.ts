import { CreateCloudFrontOriginAdapter } from './createCloudFrontOrigin.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new CreateCloudFrontOriginAdapter();

export const main = async (params: {
  input: {
    eventId: string;
    cdnDistributionId: string;
    packageDomainName: string;
  };
}): Promise<void> => adapter.handle(params);
