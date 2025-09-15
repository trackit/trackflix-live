import {
  CDNDistributionsManager,
  CreateCDNOriginParameters,
  CreateCDNOriginResponse,
  DeleteCDNOriginParameters,
} from '@trackflix-live/api-events';

export class QaCdnDistributionsManager implements CDNDistributionsManager {
  public async createOrigin(
    parameters: CreateCDNOriginParameters
  ): Promise<CreateCDNOriginResponse> {
    console.log('createOrigin', JSON.stringify(parameters, null, 2));
    return {
      eventId: parameters.eventId,
      endpoints: parameters.endpoints.map((endpoint) => ({
        type: endpoint.type,
        url: 'MOCK_CLOUDFRONT_ENDPOINT',
      })),
    };
  }

  public async deleteOrigin(
    parameters: DeleteCDNOriginParameters
  ): Promise<void> {
    console.log('deleteOrigin', JSON.stringify(parameters, null, 2));
  }
}
