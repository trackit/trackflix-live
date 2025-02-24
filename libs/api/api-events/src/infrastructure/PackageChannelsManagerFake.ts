import {
  CreatePackageChannelResponse,
  PackageChannelsManager,
} from '../ports/PackageChannelsManager';
import { EventEndpoint } from '@trackflix-live/types';

export class PackageChannelsManagerFake implements PackageChannelsManager {
  private packageChannelId = '8123456';

  public readonly createdChannels: string[] = [];

  private returnedEndpoints: EventEndpoint[] = [];

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
}
