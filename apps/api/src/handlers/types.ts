import { APIGatewayEventRequestContextV2 } from 'aws-lambda/trigger/api-gateway-proxy';

export interface CustomRequestContext extends APIGatewayEventRequestContextV2 {
  authorizer?: {
    claims: {
      [key: string]: string | string[];
    };
  };
}
