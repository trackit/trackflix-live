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
                // TODO: Set source and detail-type based on the event sent
                Source: "trackflix-live.backend",
                DetailType: "event",
                //
                Detail: JSON.stringify(event),
            }))
        };

        console.log(events);

        const command = new PutEventsCommand(parameters);

        try {
            console.log('Before PutEvents');
            await this._client.send(command);
            console.log('After PutEvents');

            return right(Result.ok<string>("OK"));
        } catch (error) {
            return left(Result.fail<string>(error));
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
