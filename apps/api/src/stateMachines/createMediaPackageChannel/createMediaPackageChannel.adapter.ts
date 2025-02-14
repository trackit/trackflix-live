import { CreatePackageChannelUseCase } from '@trackflix-live/api-events';

export class CreateMediaPackageChannelAdapter {
  private readonly useCase: CreatePackageChannelUseCase;

  public constructor({ useCase }: { useCase: CreatePackageChannelUseCase }) {
    this.useCase = useCase;
  }

  public async handle({
    eventId,
  }: {
    eventId: string;
  }): Promise<{ eventId: string; packageChannelId: string }> {
    const packageChannelId = await this.useCase.createPackageChannel(eventId);

    return {
      eventId,
      packageChannelId,
    };
  }
}
