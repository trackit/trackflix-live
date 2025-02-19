import { apiClient } from './client';
import { ListEventsRequest, ListEventsResponse } from '@trackflix-live/types';

export const listEvents = async (input: ListEventsRequest) => {
  return apiClient.get<ListEventsResponse['body']>(
    `/events?limit=${input.queryStringParameters.limit}`
  );
};
