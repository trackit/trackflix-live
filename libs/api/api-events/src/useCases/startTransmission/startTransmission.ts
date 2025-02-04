export interface StartTransmissionUseCase {
  startTransmission(eventId: string): Promise<void>;
}

export class StartTransmissionUseCaseImpl implements StartTransmissionUseCase {
  public async startTransmission(eventId: string): Promise<void> {
    console.log(`Starting transmission ${eventId}`);
  }
}
