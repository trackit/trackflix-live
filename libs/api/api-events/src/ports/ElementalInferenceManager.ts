import { createInjectionToken } from '@trackflix-live/di';

export interface ElementalInferenceManager {
    setupRealtimeCropping(channelArn: string): Promise<void>;
}

export const tokenElementalInferenceManager =
    createInjectionToken<ElementalInferenceManager>('ElementalInferenceManager');
