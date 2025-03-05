import { createInjectionToken } from '@trackflix-live/di';

export interface AssetsService {
  assetExists(uri: string): Promise<boolean>;
}

export const tokenAssetsService =
  createInjectionToken<AssetsService>('AssetsService');
