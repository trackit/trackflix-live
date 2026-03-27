import {
  ElementalInferenceClient,
  CreateFeedCommand,
  DeleteFeedCommand,
  DisassociateFeedCommand,
  GetFeedCommand,
} from '@aws-sdk/client-elementalinference';

export class ElementalInferenceManager {
  private readonly client: ElementalInferenceClient;

  public constructor({ client }: { client: ElementalInferenceClient }) {
    this.client = client;
  }

  public async createFeed(
    eventId: string
  ): Promise<{ feedArn: string; feedId: string }> {
    const response = await this.client.send(
      new CreateFeedCommand({
        name: `CroppingFeed-${eventId}`,
        outputs: [],
      })
    );

    if (!response.arn || !response.id) {
      throw new Error(
        `CreateFeedCommand returned incomplete response for event ${eventId}`
      );
    }

    await this.waitForFeedStatus(response.id, 'AVAILABLE');

    return { feedArn: response.arn, feedId: response.id };
  }


  public async deleteFeed(feedId: string): Promise<void> {
    await this.client.send(new DisassociateFeedCommand({ id: feedId }));
    await this.waitForFeedStatus(feedId, 'ARCHIVED');
    await this.client.send(new DeleteFeedCommand({ id: feedId }));
  }

  private async waitForFeedStatus(
    feedId: string,
    targetStatus: string,
    maxAttempts = 30,
    delayMs = 1000
  ): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const feed = await this.client.send(new GetFeedCommand({ id: feedId }));
      if (feed.status === targetStatus) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    throw new Error(
      `Feed ${feedId} did not reach ${targetStatus} after ${maxAttempts} attempts`
    );
  }
}
