import { tokenCreatePackageChannelUseCase } from '@trackflix-live/api-events';
import { inject } from 'di';

export class CreateMediaPackageChannelAdapter {
  private readonly useCase = inject(tokenCreatePackageChannelUseCase);

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
