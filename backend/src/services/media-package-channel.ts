import { CreateChannelCommand, DeleteChannelCommand, ListChannelsCommand, MediaPackageV2Client } from "@aws-sdk/client-mediapackagev2";
import { PackagingChannelController, PackagingChannel } from "../interfaces/packaging-channel-controller.interface";

export class MediaPackageV2ChannelController implements PackagingChannelController {
    private readonly client: MediaPackageV2Client;

    constructor(client: MediaPackageV2Client) {
        this.client = client
    }

    async create(name: string, groupName: string | undefined): Promise<PackagingChannel> {
        const command = new CreateChannelCommand({
            ChannelName: name,
            ChannelGroupName: groupName,
        })
        const response = await this.client.send(command);
        return {
            name: response.ChannelName!,
            groupName: response.ChannelGroupName
        }
    }

    async list(groupName: string | undefined): Promise<PackagingChannel[]> {
        const command = new ListChannelsCommand({
            ChannelGroupName: groupName
        });

        const response = await this.client.send(command);

        return response.Items!.map((item) => ({
            name: item.ChannelName!,
            groupName: item.ChannelGroupName
        }));

    }

    async delete(name: string, groupName: string | undefined) {
        const command = new DeleteChannelCommand({
            ChannelName: name,
            ChannelGroupName: groupName,
        });
        await this.client.send(command);
    }
}
