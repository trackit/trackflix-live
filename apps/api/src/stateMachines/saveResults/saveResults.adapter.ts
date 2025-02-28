import { tokenSaveResultsUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';

export class SaveResultsAdapter {
  private readonly useCase = inject(tokenSaveResultsUseCase);

  public async handle({ eventId }: { eventId: string }): Promise<void> {
    await this.useCase.saveResults(eventId);
  }
}
