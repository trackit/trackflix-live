import { EventsRepository } from './events-repository';
import { EventsRepositoryApi } from './events-repository.api';
import { singletonFactory } from './singleton';

export const eventsRepositorySingleton = singletonFactory<EventsRepository>({
  factory: () =>
    new EventsRepositoryApi({
      baseURL: import.meta.env.VITE_API_URL || '',
      headers: {
        'Content-Type': 'application/json',
      },
    }),
});
