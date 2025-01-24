import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { CreateEventAdapter } from './createEvent.adapter';
import { CreateEventUseCaseImpl, EventSchedulerFake, EventsRepositoryInMemory } from '@trackflix-live/api-events';

const eventScheduler = new EventSchedulerFake();
const eventsRepository = new EventsRepositoryInMemory();

const useCase = new CreateEventUseCaseImpl({
  eventScheduler,
  eventsRepository,
});

const adapter = new CreateEventAdapter({
  useCase,
});

export const main = (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => adapter.handle(event);
