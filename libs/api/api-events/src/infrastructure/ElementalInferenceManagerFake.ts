import { createInjectionToken } from '@trackflix-live/di';
import { ElementalInferenceManager } from '../ports/ElementalInferenceManager';

export class ElementalInferenceManagerFake
  implements ElementalInferenceManager
{
  public readonly setupRealtimeCroppingCalls: string[] = [];

  public async setupRealtimeCropping(channelArn: string): Promise<void> {
    this.setupRealtimeCroppingCalls.push(channelArn);
  }
}

export const tokenElementalInferenceManagerFake =
  createInjectionToken<ElementalInferenceManagerFake>(
    'ElementalInferenceManagerFake',
    {
      useClass: ElementalInferenceManagerFake,
    }
  );
