import {
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenCDNDistributionsManager,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';

export interface DeleteCDNDistributionParameters {
  eventId: string;
  cdnDistributionId: string;
}

export interface DeleteCDNDistributionUseCase {
  deleteCDNDistribution(params: DeleteCDNDistributionParameters): Promise<void>;
}

export class DeleteCDNDistributionUseCaseImpl
  implements DeleteCDNDistributionUseCase
{
  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  private readonly cdnDistributionsManager = inject(tokenCDNDistributionsManager);

  public async deleteCDNDistribution({
    eventId,
    cdnDistributionId,
  }: DeleteCDNDistributionParameters): Promise<void> {
    await this.cdnDistributionsManager.deleteDistribution(cdnDistributionId);

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: await this.eventsRepository.appendLogsToEvent(eventId, [
        {
          timestamp: Date.now(),
          type: LogType.CDN_DISTRIBUTION_DESTROYED,
        },
      ]),
    });
  }
}

export const tokenDeleteCDNDistributionUseCase =
  createInjectionToken<DeleteCDNDistributionUseCase>(
    'DeleteCDNDistributionUseCase',
    {
      useClass: DeleteCDNDistributionUseCaseImpl,
    }
  );
