import { tokenTransmissionsManager } from '../../ports';
import { createInjectionToken, inject } from 'di';

export interface StopTransmissionUseCase {
  stopTransmission(eventId: string): Promise<void>;
}

export class StopTransmissionUseCaseImpl implements StopTransmissionUseCase {
  private readonly transmissionsManager = inject(tokenTransmissionsManager);

  public async stopTransmission(eventId: string): Promise<void> {
    console.log(`Stopping transmission ${eventId}`);

    await this.transmissionsManager.stopTransmission(eventId);
  }
}

export const tokenStopTransmissionUseCase =
  createInjectionToken<StopTransmissionUseCase>('StopTransmissionUseCase', {
    useClass: StopTransmissionUseCaseImpl,
  });
