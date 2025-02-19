import { apiClient } from './client';
import { GetEventResponse } from '@trackflix-live/types';

export const getEvent = async (eventId: string) => {
  return apiClient.get<GetEventResponse['body']>(`/event/${eventId}`);
};
