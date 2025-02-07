import { EventsRepository, ListEventsResponse } from '../../ports';

export interface ListEventsUseCase {
  listEvents(limit: number, nextToken?: string): Promise<ListEventsResponse>;
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

  public async listEvents(
    limit: number,
    nextToken?: string
  ): Promise<ListEventsResponse> {
    return await this.eventsRepository.listEvents(limit, nextToken);
  }
}
