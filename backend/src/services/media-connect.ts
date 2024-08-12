import {Source, SourceController, SourceControllerResponse} from "../interfaces/source-controller.interface";
import {
    CreateFlowCommand,
    DeleteFlowCommand,
    ListFlowsCommand,
    MediaConnectClient, StartFlowCommand, StopFlowCommand
} from "@aws-sdk/client-mediaconnect";
import {SetSourceRequest} from "@aws-sdk/client-mediaconnect/dist-types/models/models_0";


export class MediaConnect implements SourceController<SetSourceRequest> {
    private readonly client: MediaConnectClient;

    constructor(client: MediaConnectClient) {
        this.client = client
    }

    async create(name: string, config: SetSourceRequest): Promise<SourceControllerResponse> {
        const command = new CreateFlowCommand({
            Name: name,
            Source: {
                ...config
            }
        })
        const response = await this.client.send(command);
        return {
            name: response.Flow.Name,
            id: response.Flow.FlowArn,
        }
    }

    async start(name: string): Promise<boolean> {
        const command = new StartFlowCommand({FlowArn: name});

        const response = await this.client.send(command);

        return !!response.FlowArn
    }

    async stop(name: string): Promise<boolean> {
        const command = new StopFlowCommand({FlowArn: name});

        const response = await this.client.send(command);

        return !!response.FlowArn
    }

    async list(): Promise<Source[]> {
        const command = new ListFlowsCommand();
        const response = await this.client.send(command);

        return response.Flows.map((source) => ({
            id: source.FlowArn,
            name: source.Name,
            status: source.Status
        }))
    }

    async delete(id: string): Promise<boolean> {
        const command = new DeleteFlowCommand({FlowArn: id});

        const response = await this.client.send(command);

        return !!response.FlowArn
    }
}