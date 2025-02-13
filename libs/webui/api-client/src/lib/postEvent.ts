import { apiClient } from './client';
import { Event } from '@trackflix-live/types';

//TODO Use shared type from backend
export interface EventInput {
  name: string;
  description: string;
  s3Bucket: string;
  s3Key: string;
  onAirStartTime: Date;
  onAirEndTime: Date;
}

export const postEvent = async (event: EventInput) => {
  return apiClient.post<Event>('/event', {
    name: event.name,
    description: event.description,
    onAirStartTime: event.onAirStartTime,
    onAirEndTime: event.onAirEndTime,
    source: {
      bucket: event.s3Bucket,
      key: event.s3Key,
    },
  });
};
