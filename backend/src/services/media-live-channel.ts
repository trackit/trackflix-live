import { ChannelState, CreateChannelCommand, CreateChannelRequest, DeleteChannelCommand, ListChannelsCommand, MediaLiveClient, StartChannelCommand, StopChannelCommand } from "@aws-sdk/client-medialive";
import { Channel, ChannelInterface } from "../interfaces/channel.interface";

export class MediaLiveChannel implements ChannelInterface<CreateChannelRequest> {
    private readonly client: MediaLiveClient;

    constructor(client: MediaLiveClient) {
        this.client = client
    }

    async create(config: CreateChannelRequest): Promise<Channel> {
        const command = new CreateChannelCommand(config);

        const response = await this.client.send(command);

        return {
            id: response.Channel?.Id!,
            name: response.Channel?.Name!,
            state: response.Channel?.State!,
        }
    }

    async list(): Promise<Channel[]> {
        const command = new ListChannelsCommand({});

        const response = await this.client.send(command);

        return response.Channels?.map(channel => {
            return {
                id: channel.Id!,
                name: channel.Name!,
                state: channel.State!,
            }
        }) || [];
    }

    async start(id: string): Promise<boolean> {
        const command = new StartChannelCommand({
            ChannelId: id
        });

        const response = await this.client.send(command);

        return response.State === ChannelState.STARTING;
    }

    async stop(id: string): Promise<boolean> {
        const command = new StopChannelCommand({
            ChannelId: id
        });

        const response = await this.client.send(command);

        return response.State === ChannelState.STOPPING;
    }

    async delete(id: string): Promise<boolean> {
        const command = new DeleteChannelCommand({
            ChannelId: id,
        });

        const response = await this.client.send(command);

        return response.State === ChannelState.DELETING;
    }
}
