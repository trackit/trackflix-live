import {
  CDNDistributionsManager,
  CreateCDNOriginParameters,
  CreateCDNOriginResponse,
} from '../ports/CDNDistributionsManager';
import { createInjectionToken } from '@trackflix-live/di';

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

    return {
      eventId: parameters.eventId,
      liveChannelArn: 'arn:aws:medialive:us-east-1:123456789012:channel:1234',
      liveChannelId: '1234',
      packageChannelId: 'abcd',
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
