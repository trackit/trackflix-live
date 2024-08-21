import { CreateHarvestJobCommand, CreateHarvestJobRequest, ListHarvestJobsCommand, MediaPackageClient } from "@aws-sdk/client-mediapackage";
import { HarvestJob, HarvestJobController } from "../interfaces/harvest-job.interface";

export class MediaPackageHarvestJob implements HarvestJobController<CreateHarvestJobRequest> {
    private readonly client: MediaPackageClient;

    constructor(client: MediaPackageClient) {
        this.client = client
    }

    async create(config: CreateHarvestJobRequest): Promise<HarvestJob> {
        const command = new CreateHarvestJobCommand(config);
        const response = await this.client.send(command);
        return {
            id: response.Id!,
            name: response.Id!,
        }
    }

    async list(): Promise<HarvestJob[]> {
        const command = new ListHarvestJobsCommand();

        const response = await this.client.send(command)

        return response.HarvestJobs!.map((job) => ({
            id: job.Id!,
            name: job.Id!
        }))
    }
}
