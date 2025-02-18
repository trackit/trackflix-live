import { PackageChannelsManager } from '../ports/PackageChannelsManager';

export class PackageChannelsManagerFake implements PackageChannelsManager {
  private packageChannelId = '8123456';

  public readonly createdChannels: string[] = [];

  public async createChannel(eventId: string): Promise<string> {
    this.createdChannels.push(eventId);
    return this.packageChannelId;
  }

  public setPackageChannelId(packageChannelId: string) {
    this.packageChannelId = packageChannelId;
  }
}
