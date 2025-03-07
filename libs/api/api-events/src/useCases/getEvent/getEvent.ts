import { tokenEventsRepository } from '../../ports';
import { Event } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils';

export interface GetEventUseCase {
  getEvent(eventId: string): Promise<Event>;
}

export class GetEventUseCaseImpl implements GetEventUseCase {
  private readonly eventsRepository = inject(tokenEventsRepository);

  public async getEvent(eventId: string): Promise<Event> {
    const event = await this.eventsRepository.getEvent(eventId);

    if (!event) {
      throw new EventDoesNotExistError();
    }

    return event;
  }
}

export const tokenGetEventUseCase = createInjectionToken<GetEventUseCase>(
  'GetEventUseCase',
  {
    useClass: GetEventUseCaseImpl,
  }
);
