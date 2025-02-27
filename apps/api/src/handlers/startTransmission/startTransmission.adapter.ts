import { tokenStartTransmissionUseCase } from '@trackflix-live/api-events';
import { inject } from 'di';

export class StartTransmissionAdapter {
  private readonly useCase = inject(tokenStartTransmissionUseCase);

  public async handle(event: { eventId: string }): Promise<void> {
    await this.useCase.startTransmission(event.eventId);
  }
}
