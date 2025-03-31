import {
  tokenCDNDistributionsManager,
  tokenEventsRepository,
  tokenEventUpdateSender,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils';

export interface DeleteCDNOriginParameters {
  eventId: string;
}

export interface DeleteCDNOriginUseCase {
  deleteCDNOrigin(
    params: DeleteCDNOriginParameters
  ): Promise<void>;
}

export class DeleteCDNOriginUseCaseImpl implements DeleteCDNOriginUseCase {
  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly cdnDistributionsManager = inject(tokenCDNDistributionsManager);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  public async deleteCDNOrigin({
    eventId,
  }: DeleteCDNOriginParameters): Promise<void> {
    const event = await this.eventsRepository.getEvent(eventId);
    if (event === undefined) {
      throw new EventDoesNotExistError();
    }

    await this.cdnDistributionsManager.deleteOrigin(
      eventId,
    );

    const currentTimestamp = Date.now();
    const logEvent = await this.eventsRepository.appendLogsToEvent(eventId, [
      {
        timestamp: currentTimestamp,
        type: LogType.CDN_ORIGIN_DESTROYED,
      },
    ]);

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: logEvent,
    });
  }
}

export const tokenDeleteCDNOriginUseCase =
  createInjectionToken<DeleteCDNOriginUseCase>('deleteCDNOriginUseCase', {
    useClass: DeleteCDNOriginUseCaseImpl,
  });
