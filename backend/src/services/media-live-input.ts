import { MediaLiveClient, CreateInputCommand, CreateInputRequest, ListInputsCommand, DeleteInputCommand } from "@aws-sdk/client-medialive";
import { InputControllerResponse, InputController, Input } from "../interfaces/input-controller.interface";

export class MediaLiveInput implements InputController<CreateInputRequest> {
    private readonly client: MediaLiveClient;

    constructor(client: MediaLiveClient) {
        this.client = client;
    }

    async create(config: CreateInputRequest): Promise<InputControllerResponse> {
        const command = new CreateInputCommand(config);

        const response = await this.client.send(command);

        return {
            id: response.Input?.Id!,
            name: response.Input?.Name!,
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