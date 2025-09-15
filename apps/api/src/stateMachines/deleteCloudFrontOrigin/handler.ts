import { DeleteCloudFrontOriginAdapter } from './deleteCloudFrontOrigin.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { registerQaInfrastructure } from '../../infrastructure/registerQaInfrastructure';

const infrastructure =
  process.env.QA_MODE !== 'true'
    ? registerProductionInfrastructure
    : registerQaInfrastructure;
infrastructure();

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
