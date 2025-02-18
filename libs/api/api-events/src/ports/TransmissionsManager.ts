export interface ResumeStartTransmissionParameters {
  taskToken: string;
  output: unknown;
}

export interface TransmissionsManager {
  startTransmission(eventId: string): Promise<void>;
  resumeStartTransmission(
    parameters: ResumeStartTransmissionParameters
  ): Promise<void>;
}
