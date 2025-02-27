import {
  CreatePackageChannelResponse,
  PackageChannelsManager,
} from '../ports/PackageChannelsManager';
import { EventEndpoint } from '@trackflix-live/types';
import { createInjectionToken } from '@trackflix-live/di';

export class PackageChannelsManagerFake implements PackageChannelsManager {
  private packageChannelId = '8123456';

  public readonly createdChannels: string[] = [];

  private returnedEndpoints: EventEndpoint[] = [];

  public readonly deletedChannels: string[] = [];

  public async createChannel(
    eventId: string
  ): Promise<CreatePackageChannelResponse> {
    this.createdChannels.push(eventId);
    return {
      channelId: this.packageChannelId,
      endpoints: this.returnedEndpoints,
    };
  }

  public setPackageChannelId(packageChannelId: string) {
    this.packageChannelId = packageChannelId;
  }

  public setPackageChannelEndpoints(endpoints: EventEndpoint[]) {
    this.returnedEndpoints = endpoints;
  }

  public async deleteChannel(eventId: string): Promise<void> {
    this.deletedChannels.push(eventId);
  }
}

export const tokenPackageChannelsManagerFake =
  createInjectionToken<PackageChannelsManagerFake>(
    'PackageChannelsManagerFake',
    {
      useClass: PackageChannelsManagerFake,
    }
  );
