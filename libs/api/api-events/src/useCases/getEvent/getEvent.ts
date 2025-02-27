import { tokenEventsRepository } from '../../ports';
import { Event } from '@trackflix-live/types';
import { inject } from 'di';

export interface GetEventUseCase {
  getEvent(eventId: string): Promise<Event | undefined>;
}

export class GetEventUseCaseImpl implements GetEventUseCase {
  private readonly eventsRepository = inject(tokenEventsRepository);

  public async getEvent(eventId: string): Promise<Event | undefined> {
    return this.eventsRepository.getEvent(eventId);
  }
}
