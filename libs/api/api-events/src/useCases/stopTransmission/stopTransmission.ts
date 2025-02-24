import { TransmissionsManager } from '../../ports';

export interface StopTransmissionUseCase {
  stopTransmission(eventId: string): Promise<void>;
}

export class StopTransmissionUseCaseImpl implements StopTransmissionUseCase {
  private readonly transmissionsManager: TransmissionsManager;

  constructor({
    transmissionsManager,
  }: {
    transmissionsManager: TransmissionsManager;
  }) {
    this.transmissionsManager = transmissionsManager;
  }

  public async stopTransmission(eventId: string): Promise<void> {
    console.log(`Stopping transmission ${eventId}`);

    await this.transmissionsManager.stopTransmission(eventId);
  }
}
