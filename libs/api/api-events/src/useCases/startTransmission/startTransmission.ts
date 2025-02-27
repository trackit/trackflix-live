import { tokenTransmissionsManager } from '../../ports';
import { inject } from 'di';

export interface StartTransmissionUseCase {
  startTransmission(eventId: string): Promise<void>;
}

export class StartTransmissionUseCaseImpl implements StartTransmissionUseCase {
  private readonly transmissionsManager = inject(tokenTransmissionsManager);

  public async startTransmission(eventId: string): Promise<void> {
    console.log(`Starting transmission ${eventId}`);

    await this.transmissionsManager.startTransmission(eventId);
  }
}
