import { tokenEventsRepository, tokenEventUpdateSender } from '../../ports';
import { EventStatus, EventUpdateAction } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';

export interface UpdateStatusUseCase {
  updateStatus(eventId: string): Promise<void>;
}

export class UpdateStatusUseCaseImpl implements UpdateStatusUseCase {
  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  private readonly eventsRepository = inject(tokenEventsRepository);

  public async updateStatus(eventId: string): Promise<void> {
    const event = await this.eventsRepository.updateEventStatus(
      eventId,
      EventStatus.TX
    );

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: event,
    });
  }
}

export const tokenUpdateStatusUseCase =
  createInjectionToken<UpdateStatusUseCase>('UpdateStatusUseCase', {
    useClass: UpdateStatusUseCaseImpl,
  });
