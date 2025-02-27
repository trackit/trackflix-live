import { tokenStopTransmissionUseCase } from '@trackflix-live/api-events';
import { inject } from 'di';

export class StopTransmissionAdapter {
  private readonly useCase = inject(tokenStopTransmissionUseCase);

  public async handle(event: { eventId: string }): Promise<void> {
    await this.useCase.stopTransmission(event.eventId);
  }
}
