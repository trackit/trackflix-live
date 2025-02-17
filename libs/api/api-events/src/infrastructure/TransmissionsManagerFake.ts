import {
  ResumeStartTransmissionParameters,
  TransmissionsManager,
} from '../ports/TransmissionsManager';

export class TransmissionsManagerFake implements TransmissionsManager {
  public readonly startedTransmissions: string[] = [];

  public readonly resumedStartedTransmissions: ResumeStartTransmissionParameters[] =
    [];

  public readonly stoppedTransmissions: string[] = [];

  public async startTransmission(eventId: string): Promise<void> {
    this.startedTransmissions.push(eventId);
  }

  public async resumeStartTransmission(
    parameters: ResumeStartTransmissionParameters
  ): Promise<void> {
    this.resumedStartedTransmissions.push(parameters);
  }

  public async stopTransmission(eventId: string): Promise<void> {
    this.stoppedTransmissions.push(eventId);
  }
}
