import { Result } from "@shared/Response";
import { Event } from "../../domain/Event";

export interface IEventManager
{
    putEvent(event: Event) : Promise<Result<void|string>>;
}
