import { CreateChannelCommand, DeleteChannelCommand, ListChannelsCommand, MediaPackageClient } from "@aws-sdk/client-mediapackage";
import { PackagingChannelController, PackagingChannel } from "../interfaces/packaging-channel.interface";

export class MediaPackageChannel implements PackagingChannelController {
    private readonly client: MediaPackageClient;

    constructor(client: MediaPackageClient) {
        this.client = client
    }

    // TODO: think about either adding a name as args or keeping id as name
    async create(id: string): Promise<PackagingChannel> {
        const command = new CreateChannelCommand({
            Id: id
        })
        const response = await this.client.send(command);
        return {
            id: response.Id!,
            name: response.Id!
        }
    }

    async list(): Promise<PackagingChannel[]> {
        const command = new ListChannelsCommand();

        const response = await this.client.send(command);

        return response.Channels!.map((item) => ({
            id: item.Id!,
            name: item.Id!
        }));
    }

    async delete(id: string) {
        const command = new DeleteChannelCommand({
            Id: id
        });
        await this.client.send(command);
    }
}
