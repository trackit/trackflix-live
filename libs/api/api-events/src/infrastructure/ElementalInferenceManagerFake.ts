import { createInjectionToken } from '@trackflix-live/di';
import { ElementalInferenceManager } from '../ports/ElementalInferenceManager';

export class ElementalInferenceManagerFake
  implements ElementalInferenceManager
{
  public readonly createFeedCalls: string[] = [];
  public readonly deleteFeedCalls: string[] = [];

  public async createFeed(
    eventId: string
  ): Promise<{ feedArn: string; feedId: string }> {
    this.createFeedCalls.push(eventId);
    return { feedArn: 'mock-feed-arn', feedId: 'mock-feed-id' };
  }

  public async deleteFeed(feedId: string): Promise<void> {
    this.deleteFeedCalls.push(feedId);
  }
}

export const tokenElementalInferenceManagerFake =
  createInjectionToken<ElementalInferenceManagerFake>(
    'ElementalInferenceManagerFake',
    {
      useClass: ElementalInferenceManagerFake,
    }
  );
