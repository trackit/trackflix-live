import {
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenPackageChannelsManager,
} from '../../ports';
import { EventStatus, EventUpdateAction, LogType } from '@trackflix-live/types';
import { inject } from 'di';

export interface DeletePackageChannelParameters {
  eventId: string;
}

export interface DeletePackageChannelUseCase {
  deletePackageChannel(params: DeletePackageChannelParameters): Promise<void>;
}

export class DeletePackageChannelUseCaseImpl
  implements DeletePackageChannelUseCase
{
  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  private readonly packageChannelsManager = inject(tokenPackageChannelsManager);

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
