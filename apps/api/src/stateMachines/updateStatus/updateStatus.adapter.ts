import { tokenUpdateStatusUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';

export class UpdateStatusAdapter {
  private readonly useCase = inject(tokenUpdateStatusUseCase);

  public async handle({ eventId }: { eventId: string }): Promise<void> {
    await this.useCase.updateStatus(eventId);
  }
}
