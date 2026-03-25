import {
  ElementalInferenceClient,
  CreateFeedCommand,
  DeleteFeedCommand,
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

    await this.waitForFeedAvailable(response.id);

    return { feedArn: response.arn, feedId: response.id };
  }

  private async waitForFeedAvailable(
    feedId: string,
    maxAttempts = 30,
    delayMs = 1000
  ): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const feed = await this.client.send(new GetFeedCommand({ id: feedId }));
      if (feed.status === 'AVAILABLE') {
        return;
      }
      if (feed.status !== 'CREATING') {
        throw new Error(
          `Feed ${feedId} entered unexpected state: ${feed.status}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    throw new Error(
      `Feed ${feedId} did not become AVAILABLE after ${maxAttempts} attempts`
    );
  }

  public async deleteFeed(feedId: string): Promise<void> {
    await this.client.send(new DeleteFeedCommand({ id: feedId }));
  }
}
