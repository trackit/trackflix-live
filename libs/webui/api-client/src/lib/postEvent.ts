import { apiClient } from './client';
import { CreateEventRequest, CreateEventResponse } from '@trackflix-live/types';

export const postEvent = async (event: CreateEventRequest['body']) => {
  return apiClient.post<CreateEventResponse['body']>('/event', {
    name: event.name,
    description: event.description,
    onAirStartTime: event.onAirStartTime,
    onAirEndTime: event.onAirEndTime,
    inputType: event.inputType,
    source: event.source,
  });
};
