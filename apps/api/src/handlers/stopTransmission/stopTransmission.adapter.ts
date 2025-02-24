import { StopTransmissionUseCase } from '@trackflix-live/api-events';

export class StopTransmissionAdapter {
  private readonly useCase: StopTransmissionUseCase;

  public constructor({ useCase }: { useCase: StopTransmissionUseCase }) {
    this.useCase = useCase;
  }

  public async handle(event: { eventId: string }): Promise<void> {
    await this.useCase.stopTransmission(event.eventId);
  }
}
