import { SaveResultsUseCase } from '@trackflix-live/api-events';

export class SaveResultsAdapter {
  private readonly useCase: SaveResultsUseCase;

  public constructor({ useCase }: { useCase: SaveResultsUseCase }) {
    this.useCase = useCase;
  }

  public async handle({ eventId }: { eventId: string }): Promise<void> {
    await this.useCase.saveResults(eventId);
  }
}
