import {
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { DeleteEventAdapter } from './deleteEvent.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';
import { CustomRequestContext } from '../types';
import { registerQaInfrastructure } from '../../infrastructure/registerQaInfrastructure';

const infrastructure =
  process.env.QA_MODE !== 'true'
    ? registerProductionInfrastructure
    : registerQaInfrastructure;
infrastructure();

const adapter = new DeleteEventAdapter();

export const main = (
  event: APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>
): Promise<APIGatewayProxyResultV2> => adapter.handle(event);
