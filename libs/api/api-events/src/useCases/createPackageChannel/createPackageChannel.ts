import {
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenPackageChannelsManager,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';
import { inject } from 'di';

export interface CreatePackageChannelUseCase {
  createPackageChannel(eventId: string): Promise<string>;
}

export class CreatePackageChannelUseCaseImpl
  implements CreatePackageChannelUseCase
{
  private readonly packageChannelsManager = inject(tokenPackageChannelsManager);

  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  public async createPackageChannel(eventId: string): Promise<string> {
    const { channelId, endpoints } =
      await this.packageChannelsManager.createChannel(eventId);

    await this.eventsRepository.appendEndpointsToEvent(eventId, endpoints);

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
