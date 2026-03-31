import {
  ElementalInferenceClient,
  CreateFeedCommand,
  DeleteFeedCommand,
  DisassociateFeedCommand,
  GetFeedCommand,
} from '@aws-sdk/client-elementalinference';

export class ElementalInferenceManager {
  private readonly client: ElementalInferenceClient;
  private readonly timeoutMs: number;
  private readonly initialDelayMs: number;

  public constructor({
    client,
    timeoutMs = 5 * 60 * 1000,
    initialDelayMs = 500,
  }: {
    client: ElementalInferenceClient;
    timeoutMs?: number;
    initialDelayMs?: number;
  }) {
    this.client = client;
    this.timeoutMs = timeoutMs;
    this.initialDelayMs = initialDelayMs;
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
    targetStatus: string
  ): Promise<void> {
    /**
     * TODO: Refactor to an asynchronous Step Functions "Wait State" pattern.
     * Current limitation: AWS Elemental Inference does not yet emit native EventBridge
     * or CloudTrail events for feed status changes.
     * WARNING: Synchronous polling within a Lambda is a temporary workaround.
     * It is subject to the 15-minute execution limit and incurs "idle" compute costs.
     */
    const startTime = Date.now();
    let attempt = 0;
    while (Date.now() - startTime < this.timeoutMs) {
      const feed = await this.client.send(new GetFeedCommand({ id: feedId }));
      if (feed.status === targetStatus) {
        return;
      }
      const delay = this.initialDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }
    throw new Error(
      `Feed ${feedId} did not reach ${targetStatus} within ${this.timeoutMs}ms`
    );
  }
}
