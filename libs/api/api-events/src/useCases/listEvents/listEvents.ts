import {
  ListEventsParams,
  ListEventsResponse,
  tokenEventsRepository,
} from '../../ports';
import { createInjectionToken, inject } from '@trackflix-live/di';

export interface ListEventsUseCase {
  listEvents(params: ListEventsParams): Promise<ListEventsResponse>;
}

export class ListEventsUseCaseImpl implements ListEventsUseCase {
  private readonly eventsRepository = inject(tokenEventsRepository);

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

export const tokenListEventsUseCase = createInjectionToken<ListEventsUseCase>(
  'ListEventsUseCase',
  { useClass: ListEventsUseCaseImpl }
);
