import { EventsRepository, ListEventsResponse } from '../../ports';

export interface ListEventsParams {
  limit: number;
  sortBy?: 'name' | 'onAirStartTime' | 'onAirEndTime' | 'status';
  sortOrder?: 'asc' | 'desc';
  nextToken?: string;
}

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
  }: ListEventsParams): Promise<ListEventsResponse> {
    return await this.eventsRepository.listEvents({
      limit,
      sortBy,
      sortOrder,
      nextToken,
    });
  }
}
