import { createInjectionToken } from '@trackflix-live/di';

export interface ElementalInferenceManager {
  createFeed(eventId: string): Promise<{ feedArn: string; feedId: string }>;
  deleteFeed(feedId: string): Promise<void>;
}

export const tokenElementalInferenceManager =
  createInjectionToken<ElementalInferenceManager>('ElementalInferenceManager');
