import { DeleteCloudFrontOriginAdapter } from './deleteCloudFrontOrigin.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new DeleteCloudFrontOriginAdapter();

export const main = async (params: {
  eventId: string;
}): Promise<{
  eventId: string;
}> => {
  await adapter.handle(params);
  return {
    eventId: params.eventId,
  };
};
