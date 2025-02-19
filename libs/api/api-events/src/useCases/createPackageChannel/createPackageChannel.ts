import {
  EventsRepository,
  EventUpdateSender,
  PackageChannelsManager,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';

export interface CreatePackageChannelUseCase {
  createPackageChannel(eventId: string): Promise<string>;
}

export class CreatePackageChannelUseCaseImpl
  implements CreatePackageChannelUseCase
{
  private readonly packageChannelsManager: PackageChannelsManager;

  private readonly eventsRepository: EventsRepository;

  private readonly eventUpdateSender: EventUpdateSender;

  public constructor({
    packageChannelsManager,
    eventsRepository,
    eventUpdateSender,
  }: {
    packageChannelsManager: PackageChannelsManager;
    eventsRepository: EventsRepository;
    eventUpdateSender: EventUpdateSender;
  }) {
    this.packageChannelsManager = packageChannelsManager;
    this.eventsRepository = eventsRepository;
    this.eventUpdateSender = eventUpdateSender;
  }

  public async createPackageChannel(eventId: string): Promise<string> {
    const channelId = this.packageChannelsManager.createChannel(eventId);

    const event = await this.eventsRepository.appendLogsToEvent(eventId, [
      {
        timestamp: Date.now(),
        type: LogType.PACKAGE_CHANNEL_CREATED,
      },
    ]);

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: event,
    });

    return channelId;
  }
}
