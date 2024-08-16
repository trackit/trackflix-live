import { CreatePackagingConfigurationCommand, CreatePackagingConfigurationRequest, DeletePackagingConfigurationCommand, ListPackagingConfigurationsCommand, MediaPackageVodClient } from "@aws-sdk/client-mediapackage-vod";
import { PackagingConfiguration, PackagingConfigurationInterface } from "../interfaces/packaging-configuration.interface";


export class MediaPackageVodPackagingConfiguration implements PackagingConfigurationInterface<CreatePackagingConfigurationRequest> {
    private readonly client: MediaPackageVodClient;

    constructor(client: MediaPackageVodClient) {
        this.client = client
    }

    async create(config: CreatePackagingConfigurationRequest): Promise<PackagingConfiguration> {
        const command = new CreatePackagingConfigurationCommand(config);
        const response = await this.client.send(command);
        return {
            id: response.Id!,
            name: response.Id!,
            packagingGroupId: response.PackagingGroupId!
        }
    }

    async list(): Promise<PackagingConfiguration[]> {
        const command = new ListPackagingConfigurationsCommand();

        const response = await this.client.send(command)

        return response.PackagingConfigurations!.map((config) => ({
            id: config.Id!,
            name: config.Id!,
            packagingGroupId: config.PackagingGroupId!
        }))
    }

    async delete(id: string) {
        const command = new DeletePackagingConfigurationCommand({
            Id: id
        });

        await this.client.send(command)
    }
}
