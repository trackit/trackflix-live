import { EventsRepository } from '../../ports';
import { Event } from '@trackflix-live/types';

export interface ListEventsUseCase {
  listEvents(): Promise<Event[]>;
}

export class ListEventsUseCaseImpl implements ListEventsUseCase {
  private readonly eventsRepository: EventsRepository;

  public constructor({
    eventsRepository,
  }: {
    eventsRepository: EventsRepository;
  }) {
    this.eventsRepository = eventsRepository;
  }

  public async listEvents(): Promise<Event[]> {
    return await this.eventsRepository.listEvents();
  }
}
