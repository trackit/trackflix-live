import { tokenSetErrorStatusUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';

export class SetErrorStatusAdapter {
  private readonly useCase = inject(tokenSetErrorStatusUseCase);

  public async handle({ eventId }: { eventId: string }): Promise<void> {
    await this.useCase.setErrorStatus(eventId);
  }
}
