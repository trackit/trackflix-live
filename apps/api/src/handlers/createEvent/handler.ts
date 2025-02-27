import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { CreateEventAdapter } from './createEvent.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new CreateEventAdapter();

export const main = (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => adapter.handle(event);
