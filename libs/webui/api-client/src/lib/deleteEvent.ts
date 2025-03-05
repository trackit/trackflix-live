import { apiClient } from './client';
import { DeleteEventResponse } from '@trackflix-live/types';

export const deleteEvent = async (eventId: string) => {
  return apiClient.delete<DeleteEventResponse['body']>(`/event/${eventId}`);
};
