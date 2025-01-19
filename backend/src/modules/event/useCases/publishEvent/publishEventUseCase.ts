import { UseCase } from "@shared/UseCase";
import { IEventManager } from "../../services/eventManager/IEventManager";
import { Result } from "@shared/Response";
import { Event } from "../../domain/Event";

export class PublishEventUseCase implements UseCase<Event, Promise<Result<string>>> {
    private _eventManager: IEventManager;

    constructor(eventManager: IEventManager) {
        this._eventManager = eventManager;
    }

    async execute(event: Event): Promise<Result<string>> {
        try {
            await this._eventManager.putEvent(event);

            return Result.ok<string>();
        } catch (error) {
            console.error('error occured ', error);
            return Result.fail<string>(error);
        }
    }
}
