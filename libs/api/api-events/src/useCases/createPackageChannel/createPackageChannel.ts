import {
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenPackageChannelsManager,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';

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

    await this.eventsRepository.updateEndpoints(eventId, endpoints);

    const packageDomainName = endpoints.at(0)?.url.replace('https://', '').split('/')[0] ?? '';
    await this.eventsRepository.updatePackageDomainName(eventId, packageDomainName);

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

export const tokenCreatePackageChannelUseCase =
  createInjectionToken<CreatePackageChannelUseCase>(
    'CreatePackageChannelUseCase',
    {
      useClass: CreatePackageChannelUseCaseImpl,
    }
  );
