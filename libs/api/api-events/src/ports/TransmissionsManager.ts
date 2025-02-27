import { createInjectionToken } from 'di';

export interface ResumeStartTransmissionParameters {
  taskToken: string;
  output: unknown;
}

export interface TransmissionsManager {
  startTransmission(eventId: string): Promise<void>;
  resumeStartTransmission(
    parameters: ResumeStartTransmissionParameters
  ): Promise<void>;

  stopTransmission(eventId: string): Promise<void>;
}

export const tokenTransmissionsManager =
  createInjectionToken<TransmissionsManager>('TransmissionsManager');
