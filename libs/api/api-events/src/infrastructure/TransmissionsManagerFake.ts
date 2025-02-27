import {
  ResumeStartTransmissionParameters,
  TransmissionsManager,
} from '../ports/TransmissionsManager';
import { createInjectionToken } from '@trackflix-live/di';
import { TaskTokensRepositoryInMemory } from './TaskTokensRepositoryInMemory';

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

export const tokenTransmissionsManagerFake =
  createInjectionToken<TransmissionsManagerFake>('TransmissionsManagerFake', {
    useClass: TransmissionsManagerFake,
  });
