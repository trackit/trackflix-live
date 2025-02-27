import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { AttachIotPolicyUseCaseImpl } from '@trackflix-live/api-events';
import { AttachIotPolicyAdapter } from './attachIotPolicy.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const useCase = new AttachIotPolicyUseCaseImpl();

const adapter = new AttachIotPolicyAdapter({
  useCase,
});

export const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => adapter.handle(event);
