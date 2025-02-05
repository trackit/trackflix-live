import { TransmissionsManager } from '../../ports';

export interface StartTransmissionUseCase {
  startTransmission(eventId: string): Promise<void>;
}

export class StartTransmissionUseCaseImpl implements StartTransmissionUseCase {
  private readonly transmissionsManager: TransmissionsManager;

  constructor({
    transmissionsManager,
  }: {
    transmissionsManager: TransmissionsManager;
  }) {
    this.transmissionsManager = transmissionsManager;
  }

  public async startTransmission(eventId: string): Promise<void> {
    console.log(`Starting transmission ${eventId}`);

    await this.transmissionsManager.startTransmission(eventId);
  }
}
