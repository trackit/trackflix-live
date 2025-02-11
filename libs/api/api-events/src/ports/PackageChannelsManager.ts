export interface PackageChannelsManager {
  createChannel(eventId: string): Promise<string>;
}
