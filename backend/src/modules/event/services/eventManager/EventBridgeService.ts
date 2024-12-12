import { IEventManager } from "./IEventManager";
import { EventBridgeClient, PutEventsCommand, PutEventsRequest} from "@aws-sdk/client-eventbridge";
import { left, right, Result } from "@shared/Response";
import { Event } from "../../domain/Event";

export class EventBridgeService implements IEventManager
{
    private readonly _client: EventBridgeClient;

    constructor(client: EventBridgeClient) {
        this._client = client;
    }

    async putEvents(events: Event[])
    {
        const parameters: PutEventsRequest = {
            Entries: events.map((event) => ({
                Source: "source",
                DetailType: "detail-type",
                Detail: JSON.stringify(event),
            }))
        };

        const command = new PutEventsCommand(parameters);

        try {
            await this._client.send(command);

            return right(Result.ok<void>());
        } catch (error) {
            return left(Result.fail<void>(error));
        }
    }

    async putEvent(event: Event)
    {
        const request = await this.putEvents([event]);

        if (request.isLeft()) {
            return Result.fail<void>(request.value as string);
        }

        return Result.ok<void>();
    }
}
