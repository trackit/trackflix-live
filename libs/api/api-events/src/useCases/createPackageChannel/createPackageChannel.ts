import { PackageChannelsManager } from '../../ports';

export interface CreatePackageChannelUseCase {
  createPackageChannel(eventId: string): Promise<string>;
}

export class CreatePackageChannelUseCaseImpl
  implements CreatePackageChannelUseCase
{
  private readonly packageChannelsManager: PackageChannelsManager;

  public constructor({
    packageChannelsManager,
  }: {
    packageChannelsManager: PackageChannelsManager;
  }) {
    this.packageChannelsManager = packageChannelsManager;
  }

  public async createPackageChannel(eventId: string): Promise<string> {
    return this.packageChannelsManager.createChannel(eventId);
  }
}
