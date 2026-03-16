import {
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenPackageChannelsManager,
} from '../../ports';
import {
  EventEndpoint,
  EventUpdateAction,
  LogType,
} from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';

export interface CreatePackageChannelUseCase {
  createPackageChannel(eventId: string): Promise<{
    packageChannelId: string;
    verticalPackageChannelId: string;
    packageDomainName: string;
    verticalPackageDomainName: string;
    endpoints: EventEndpoint[];
  }>;
}

export class CreatePackageChannelUseCaseImpl
  implements CreatePackageChannelUseCase
{
  private readonly packageChannelsManager = inject(tokenPackageChannelsManager);

  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  public async createPackageChannel(eventId: string): Promise<{
    packageChannelId: string;
    verticalPackageChannelId: string;
    packageDomainName: string;
    verticalPackageDomainName: string;
    endpoints: EventEndpoint[];
  }> {
    const { mainChannelId, verticalChannelId, endpoints } =
      await this.packageChannelsManager.createChannel(eventId);

    await this.eventsRepository.updateEndpoints(eventId, endpoints);

    const packageDomainName =
      endpoints
        .find((e) => e.orientation === 'HORIZONTAL')
        ?.url.replace('https://', '')
        .split('/')[0] ?? '';
    const verticalPackageDomainName =
      endpoints
        .find((e) => e.orientation === 'VERTICAL')
        ?.url.replace('https://', '')
        .split('/')[0] ?? '';

    await this.eventsRepository.updatePackageDomainName(
      eventId,
      packageDomainName
    );
    await this.eventsRepository.updateVerticalPackageDomainName(
      eventId,
      verticalPackageDomainName
    );

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

    return {
      packageChannelId: mainChannelId,
      verticalPackageChannelId: verticalChannelId,
      packageDomainName,
      verticalPackageDomainName,
      endpoints,
    };
  }
}

export const tokenCreatePackageChannelUseCase =
  createInjectionToken<CreatePackageChannelUseCase>(
    'CreatePackageChannelUseCase',
    {
      useClass: CreatePackageChannelUseCaseImpl,
    }
  );
