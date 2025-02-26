import {
  EventsRepository,
  ListEventsParams,
  ListEventsResponse,
} from '../../ports';

export interface ListEventsUseCase {
  listEvents(params: ListEventsParams): Promise<ListEventsResponse>;
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

  public async listEvents({
    limit,
    sortBy,
    sortOrder = 'asc',
    nextToken,
    name,
  }: ListEventsParams): Promise<ListEventsResponse> {
    return await this.eventsRepository.listEvents({
      limit,
      sortBy,
      sortOrder,
      nextToken,
      name,
    });
  }
}
