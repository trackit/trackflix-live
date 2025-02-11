import { EventsRepository } from '../../ports';
import { Event } from '@trackflix-live/types';

export interface GetEventUseCase {
  getEvent(eventId: string): Promise<Event | undefined>;
}

export class GetEventUseCaseImpl implements GetEventUseCase {
  private readonly eventsRepository: EventsRepository;

  public constructor({
    eventsRepository,
  }: {
    eventsRepository: EventsRepository;
  }) {
    this.eventsRepository = eventsRepository;
  }

  public async getEvent(eventId: string): Promise<Event | undefined> {
    return this.eventsRepository.getEvent(eventId);
  }
}
