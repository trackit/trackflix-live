import { TransmissionsManager } from '../ports/TransmissionsManager';

export class TransmissionsManagerFake implements TransmissionsManager {
  public readonly startedTransmissions: string[] = [];

  public async startTransmission(eventId: string): Promise<void> {
    this.startedTransmissions.push(eventId);
  }
}
