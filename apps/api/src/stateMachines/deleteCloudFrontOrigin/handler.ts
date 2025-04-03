import { DeleteCloudFrontOriginAdapter } from './deleteCloudFrontOrigin.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new DeleteCloudFrontOriginAdapter();

export const main = async (params: {
  eventId: string;
}): Promise<{
  eventId: string;
}> => {
  const cdnDistributionId = process.env.DISTRIBUTION_ID;
  if (!cdnDistributionId) {
    throw new Error('DISTRIBUTION_ID environment variable is not set');
  }
  await adapter.handle({ ...params, cdnDistributionId });
  return {
    eventId: params.eventId,
  };
};
