import { CreatePackagingGroupCommand, CreatePackagingGroupRequest, DeletePackagingGroupCommand, ListPackagingGroupsCommand, MediaPackageVodClient } from "@aws-sdk/client-mediapackage-vod";
import { PackagingGroup, PackagingGroupInterface } from "../interfaces/packaging-group.interface";


export class MediaPackageVodPackagingGroup implements PackagingGroupInterface<CreatePackagingGroupRequest> {
    private readonly client: MediaPackageVodClient;

    constructor(client: MediaPackageVodClient) {
        this.client = client
    }

    async create(config: CreatePackagingGroupRequest): Promise<PackagingGroup> {
        const command = new CreatePackagingGroupCommand(config);
        const response = await this.client.send(command);
        return {
            id: response.Id!,
            name: response.Id!
        }
    }

    async list(): Promise<PackagingGroup[]> {
        const command = new ListPackagingGroupsCommand();

        const response = await this.client.send(command)

        return response.PackagingGroups!.map((group) => ({
            id: group.Id!,
            name: group.Id!
        }))
    }

    async delete(id: string) {
        const command = new DeletePackagingGroupCommand({
            Id: id
        });

        await this.client.send(command)
    }
}
