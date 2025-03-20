import {
  tokenCDNDistributionsManager,
  tokenEventsRepository,
  tokenEventUpdateSender,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils';

export interface createCDNDistributionParameters {
  eventId: string;
  packageDomainName: string;
}

export interface createCDNDistributionResponse {
  cdnDistributionId: string;
}

export interface createCDNDistributionUseCase {
  createCDNDistribution(
    params: createCDNDistributionParameters
  ): Promise<createCDNDistributionResponse>;
}

export class createCDNDistributionUseCaseImpl implements createCDNDistributionUseCase {
  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly CDNDistributionsManager = inject(tokenCDNDistributionsManager);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  public async createCDNDistribution({
    eventId,
    packageDomainName,
  }: createCDNDistributionParameters): Promise<createCDNDistributionResponse> {
    const event = await this.eventsRepository.getEvent(eventId);
    if (event === undefined) {
      throw new EventDoesNotExistError();
    }

    const cdnDistribution = await this.CDNDistributionsManager.createDistribution(
      eventId,
      packageDomainName
    );

    const currentTimestamp = Date.now();
    await this.eventsRepository.appendLogsToEvent(eventId, [
      {
        timestamp: currentTimestamp,
        type: LogType.CDN_DISTRIBUTION_CREATED,
      },
    ]);

    const eventAfterUpdate =
      await this.eventsRepository.updateCDNDistributionId(
        eventId,
        cdnDistribution.cdnDistributionId
      );

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: eventAfterUpdate,
    });

    return {
      cdnDistributionId: cdnDistribution.cdnDistributionId,
    };
  }
}

export const tokencreateCDNDistributionUseCase =
  createInjectionToken<createCDNDistributionUseCase>('createCDNDistributionUseCase', {
    useClass: createCDNDistributionUseCaseImpl,
  });
