import { CreateOriginEndpointCommand, CreateOriginEndpointRequest, DeleteOriginEndpointCommand, ListOriginEndpointsCommand, MediaPackageClient } from "@aws-sdk/client-mediapackage";
import { OriginEndpoint, OriginEndpointController } from "../interfaces/origin-endpoint.interface";

export class MediaPackageEndpoint implements OriginEndpointController<CreateOriginEndpointRequest> {
    private readonly client: MediaPackageClient;

    constructor(client: MediaPackageClient) {
        this.client = client
    }

    // TODO: think about either adding a name as args or keeping id as name
    async create(config: CreateOriginEndpointRequest): Promise<OriginEndpoint> {
        const command = new CreateOriginEndpointCommand(config)
        const response = await this.client.send(command);
        return {
            id: response.Id!,
            name: response.Id!,
            channelId: response.ChannelId!
        }
    }

    async list(): Promise<OriginEndpoint[]> {
        const command = new ListOriginEndpointsCommand();

        const response = await this.client.send(command);

        return response.OriginEndpoints!.map((item) => ({
            id: item.Id!,
            name: item.Id!,
            channelId: item.ChannelId!
        }));
    }

    async delete(id: string) {
        const command = new DeleteOriginEndpointCommand({
            Id: id
        });
        await this.client.send(command);
    }
}
