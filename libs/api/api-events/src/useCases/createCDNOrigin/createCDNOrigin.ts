import {
  tokenCDNDistributionsManager,
  tokenEventsRepository,
  tokenEventUpdateSender,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils';

export interface CreateCDNOriginParameters {
  eventId: string;
  cdnDistributionId: string;
  packageDomainName: string;
}

export interface CreateCDNOriginUseCase {
  createCDNOrigin(
    params: CreateCDNOriginParameters
  ): Promise<void>;
}

export class CreateCDNOriginUseCaseImpl implements CreateCDNOriginUseCase {
  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly cdnDistributionsManager = inject(tokenCDNDistributionsManager);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  public async createCDNOrigin({
    eventId,
    cdnDistributionId,
    packageDomainName,
  }: CreateCDNOriginParameters): Promise<void> {
    const event = await this.eventsRepository.getEvent(eventId);
    if (event === undefined) {
      throw new EventDoesNotExistError();
    }

    await this.cdnDistributionsManager.createOrigin(
      eventId,
      cdnDistributionId,
      packageDomainName
    );

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
  }
}

export const tokenCreateCDNOriginUseCase =
  createInjectionToken<CreateCDNOriginUseCase>('CreateCDNOriginUseCase', {
    useClass: CreateCDNOriginUseCaseImpl,
  });
