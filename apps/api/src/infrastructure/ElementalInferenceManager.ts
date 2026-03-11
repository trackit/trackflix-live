import {
    ElementalInferenceClient,
    CreateFeedCommand,
    AssociateFeedCommand,
    OutputStatus,
    ListFeedsCommand,
    DeleteFeedCommand,
} from '@aws-sdk/client-elementalinference';

export class ElementalInferenceManager {
    private readonly client: ElementalInferenceClient;

    public constructor({
        client,
    }: {
        client: ElementalInferenceClient;
    }) {
        this.client = client;
    }

    public async setupRealtimeCropping(channelArn: string): Promise<void> {
        try {
            await this.cleanupFeeds();

            const feedName = `CroppingFeed-${Date.now()}`;
            console.log(`Creating real-time cropping feed: ${feedName} for channel: ${channelArn}`);

            // 1. Create the inference feed
            const createFeedResponse = await this.client.send(
                new CreateFeedCommand({
                    name: feedName,
                    outputs: [],
                })
            );

            if (!createFeedResponse.id) {
                throw new Error(`Failed to create Elemental Inference Feed for channel ${channelArn}`);
            }

            // 2. Associate the feed with the MediaLive channel ID and configure cropping
            // Note: associatedResourceName does not allow ARNs. We must extract the ID (last part of the ARN).
            const channelId = channelArn.split(':').pop() || channelArn;

            await this.client.send(
                new AssociateFeedCommand({
                    id: createFeedResponse.id,
                    associatedResourceName: channelId,
                    outputs: [
                        {
                            name: 'CroppingOutput',
                            status: OutputStatus.ENABLED,
                            outputConfig: {
                                cropping: {},
                            },
                        },
                    ],
                })
            );

            console.log(`Successfully associated cropping feed ${createFeedResponse.id} with channel ${channelArn}`);
        } catch (error) {
            console.error(`Error during smart cropping setup for channel ${channelArn}:`, error);
            // Non-blocking: we log the error but don't rethrow to avoid blocking the entire stream creation flow.
            // This is especially important for ServiceQuotaExceededException.
        }
    }

    private async cleanupFeeds(): Promise<void> {
        try {
            const listResponse = await this.client.send(new ListFeedsCommand({}));
            const feeds = listResponse.feeds || [];

            // If we have more than 0 feeds, try to clean up. 
            // Quota is usually very low (1 or 2), and feeds can leak if deletion fails.
            if (feeds.length > 0) {
                console.log(`Found ${feeds.length} existing Elemental Inference feeds. Cleaning up...`);
                for (const feed of feeds) {
                    if (feed.id) {
                        try {
                            await this.client.send(new DeleteFeedCommand({ id: feed.id }));
                            console.log(`Deleted Elemental Inference feed: ${feed.id}`);
                        } catch (deleteError) {
                            console.warn(`Could not delete feed ${feed.id}:`, deleteError);
                        }
                    }
                }
            }
        } catch (listError) {
            console.warn('Could not list/cleanup Elemental Inference feeds:', listError);
        }
    }
}
