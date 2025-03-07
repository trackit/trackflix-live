import { apiClient } from './client';
import { ListEventsRequest, ListEventsResponse } from '@trackflix-live/types';

export const listEvents = async (input: ListEventsRequest) => {
  const searchParams = new URLSearchParams();
  if (input.queryStringParameters.limit) {
    searchParams.set('limit', input.queryStringParameters.limit);
  }
  if (input.queryStringParameters.nextToken) {
    searchParams.set('nextToken', input.queryStringParameters.nextToken);
  }
  if (input.queryStringParameters.sortBy) {
    searchParams.set('sortBy', input.queryStringParameters.sortBy);
  }
  if (input.queryStringParameters.sortOrder) {
    searchParams.set('sortOrder', input.queryStringParameters.sortOrder);
  }
  if (
    input.queryStringParameters.name &&
    input.queryStringParameters.name !== ''
  ) {
    searchParams.set('name', input.queryStringParameters.name);
  }
  // Clear sortOrder if sortBy is not provided
  if (!input.queryStringParameters.sortBy) {
    searchParams.delete('sortOrder');
  }

  return apiClient.get<ListEventsResponse['body']>(
    `/events?${searchParams.toString()}`
  );
};
