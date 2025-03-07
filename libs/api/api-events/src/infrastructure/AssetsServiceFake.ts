import { createInjectionToken } from '@trackflix-live/di';
import { AssetsService } from '../ports';

export class AssetsServiceFake implements AssetsService {
  private readonly assets: string[] = [];

  public async assetExists(uri: string): Promise<boolean> {
    return this.assets.includes(uri);
  }

  public addAsset(uri: string) {
    this.assets.push(uri);
  }
}

export const tokenAssetsServiceFake = createInjectionToken<AssetsServiceFake>(
  'AssetsServiceFake',
  {
    useClass: AssetsServiceFake,
  }
);
