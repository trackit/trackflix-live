import { StartTransmissionUseCase } from '@trackflix-live/api-events';

export class StartTransmissionAdapter {
  private readonly useCase: StartTransmissionUseCase;

  public constructor({ useCase }: { useCase: StartTransmissionUseCase }) {
    this.useCase = useCase;
  }

  public async handle(event: { eventId: string }): Promise<void> {
    await this.useCase.startTransmission(event.eventId);
  }
}
