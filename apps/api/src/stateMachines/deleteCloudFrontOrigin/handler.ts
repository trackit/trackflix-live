import { DeleteCloudFrontOriginAdapter } from './deleteCloudFrontOrigin.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new DeleteCloudFrontOriginAdapter();

export const main = async (params: {
  input: {
    eventId: string;
    cdnDistributionId: string;
  };
}): Promise<void> => adapter.handle(params);
