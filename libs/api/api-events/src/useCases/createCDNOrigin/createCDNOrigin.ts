import {
  CreateCDNOriginParameters,
  CreateCDNOriginResponse,
  tokenCDNDistributionsManager,
  tokenEventsRepository,
  tokenEventUpdateSender,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils';

export interface CreateCDNOriginUseCase {
  createCDNOrigin(
    params: CreateCDNOriginParameters
  ): Promise<CreateCDNOriginResponse>;
}

export class CreateCDNOriginUseCaseImpl implements CreateCDNOriginUseCase {
  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly cdnDistributionsManager = inject(tokenCDNDistributionsManager);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  public async createCDNOrigin({
    eventId,
    packageDomainName,
    verticalPackageDomainName,
    endpoints,
  }: CreateCDNOriginParameters): Promise<CreateCDNOriginResponse> {
    const event = await this.eventsRepository.getEvent(eventId);
    if (event === undefined) {
      throw new EventDoesNotExistError();
    }

    const { endpoints: updatedEndpoints } =
      await this.cdnDistributionsManager.createOrigin({
        eventId,
        packageDomainName: packageDomainName,
        verticalPackageDomainName: verticalPackageDomainName,
        endpoints: endpoints,
      });

    await this.eventsRepository.updateEndpoints(eventId, updatedEndpoints);

    const currentTimestamp = Date.now();
    const logEvent = await this.eventsRepository.appendLogsToEvent(eventId, [
      {
        timestamp: currentTimestamp,
        type: LogType.CDN_ORIGIN_CREATED,
      },
    ]);

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: logEvent,
    });

    return {
      eventId,
      endpoints,
    };
  }
}

export const tokenCreateCDNOriginUseCase =
  createInjectionToken<CreateCDNOriginUseCase>('CreateCDNOriginUseCase', {
    useClass: CreateCDNOriginUseCaseImpl,
  });
