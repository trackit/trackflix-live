import {
  CDNDistributionsManager,
  CreateCDNOriginParameters,
  CreateCDNOriginResponse,
} from '../ports/CDNDistributionsManager';
import { createInjectionToken } from '@trackflix-live/di';
import { EndpointType } from '@trackflix-live/types';

export class CDNDistributionsManagerFake implements CDNDistributionsManager {

  public readonly createdOrigins: {
    eventId: string;
    packageDomainName: string;
  }[] = [];

  public readonly deletedOrigins: { eventId: string }[] = [];

  public async createOrigin(
    parameters: CreateCDNOriginParameters
  ): Promise<CreateCDNOriginResponse> {
    this.createdOrigins.push({
      eventId: parameters.eventId,
      packageDomainName: parameters.packageDomainName,
    });

    const mockEndpoints = [...parameters.endpoints];
    const hlsEndpoint = mockEndpoints.find(
      (endpoint) => endpoint.type === EndpointType.HLS
    );
    if (hlsEndpoint) {
      hlsEndpoint.url = `https://fake-distribution.cloudfront.net${hlsEndpoint.url.split('amazonaws.com')[1] || '/hls/index.m3u8'}`;
    }
    
    const dashEndpoint = mockEndpoints.find(
      (endpoint) => endpoint.type === EndpointType.DASH
    );
    if (dashEndpoint) {
      dashEndpoint.url = `https://fake-distribution.cloudfront.net${dashEndpoint.url.split('amazonaws.com')[1] || '/dash/index.mpd'}`;
    }

    return {
      eventId: parameters.eventId,
      liveChannelArn: 'arn:aws:medialive:us-east-1:123456789012:channel:1234',
      liveChannelId: '1234',
      packageChannelId: 'abcd',
      endpoints: mockEndpoints,
    };
  }

  public async deleteOrigin(eventId: string): Promise<void> {
    this.deletedOrigins.push({eventId});
  }
}

export const tokenCDNDistributionsManagerFake =
  createInjectionToken<CDNDistributionsManagerFake>(
    'CDNDistributionsManagerFake',
    {
      useClass: CDNDistributionsManagerFake,
    }
  );
