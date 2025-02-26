import {
  EventsRepository,
  EventUpdateSender,
  PackageChannelsManager,
} from '../../ports';
import { EventStatus, EventUpdateAction, LogType } from '@trackflix-live/types';

export interface DeletePackageChannelParameters {
  eventId: string;
}

export interface DeletePackageChannelUseCase {
  deletePackageChannel(params: DeletePackageChannelParameters): Promise<void>;
}

export class DeletePackageChannelUseCaseImpl
  implements DeletePackageChannelUseCase
{
  private readonly eventsRepository: EventsRepository;

  private readonly eventUpdateSender: EventUpdateSender;

  private readonly packageChannelsManager: PackageChannelsManager;

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

  public async deletePackageChannel({
    eventId,
  }: DeletePackageChannelParameters): Promise<void> {
    await this.packageChannelsManager.deleteChannel(eventId);

    await this.eventsRepository.updateEventStatus(eventId, EventStatus.ENDED);
    await this.eventsRepository.updateEventDestroyedTime(
      eventId,
      new Date().toISOString()
    );

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: await this.eventsRepository.appendLogsToEvent(eventId, [
        {
          timestamp: Date.now(),
          type: LogType.PACKAGE_CHANNEL_DESTROYED,
        },
      ]),
    });
  }
}
