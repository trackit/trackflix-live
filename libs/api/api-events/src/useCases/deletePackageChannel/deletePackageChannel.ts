import { PackageChannelsManager } from '../../ports';

export interface DeletePackageChannelParameters {
  eventId: string;
}

export interface DeletePackageChannelUseCase {
  deletePackageChannel(params: DeletePackageChannelParameters): Promise<void>;
}

export class DeletePackageChannelUseCaseImpl
  implements DeletePackageChannelUseCase
{
  private readonly packageChannelsManager: PackageChannelsManager;

  public constructor({
    packageChannelsManager,
  }: {
    packageChannelsManager: PackageChannelsManager;
  }) {
    this.packageChannelsManager = packageChannelsManager;
  }

  public async deletePackageChannel({
    eventId,
  }: DeletePackageChannelParameters): Promise<void> {
    await this.packageChannelsManager.deleteChannel(eventId);
  }
}
