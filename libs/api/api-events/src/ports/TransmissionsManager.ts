export interface TransmissionsManager {
  startTransmission(eventId: string): Promise<void>;
}
