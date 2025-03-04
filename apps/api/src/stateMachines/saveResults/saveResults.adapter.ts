import { tokenSaveResultsUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';

export class SaveResultsAdapter {
  private readonly useCase = inject(tokenSaveResultsUseCase);

  public async handle({
    eventId,
  }: {
    eventId: string;
  }): Promise<{ onAirStartTime: string; eventId: string }> {
    const event = await this.useCase.saveResults(eventId);
    return { onAirStartTime: event.onAirStartTime, eventId };
  }
}
