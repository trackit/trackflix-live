import { MediaLiveClient, CreateInputCommand, CreateInputRequest, ListInputsCommand, DeleteInputCommand } from "@aws-sdk/client-medialive";
import { InputController, Input } from "../interfaces/input.interface";

export class MediaLiveInput implements InputController<CreateInputRequest> {
    private readonly client: MediaLiveClient;

    constructor(client: MediaLiveClient) {
        this.client = client;
    }

    async create(config: CreateInputRequest): Promise<Input> {
        const command = new CreateInputCommand(config);

        const response = await this.client.send(command);

        return {
            id: response.Input?.Id!,
            name: response.Input?.Name!,
            type: response.Input?.Type!,
            state: response.Input?.State!,
        }
    }

    async list(): Promise<Input[]> {
        const command = new ListInputsCommand({});

        const response = await this.client.send(command);

        return response.Inputs?.map(input => {
            return {
                id: input.Id!,
                name: input.Name!,
                type: input.Type!,
                state: input.State!,
            }
        }) || [];
    }

    async delete(id: string): Promise<boolean> {
        const command = new DeleteInputCommand({
            InputId: id
        });

        const response = await this.client.send(command);

        return response.$metadata.httpStatusCode === 200;
    }
}