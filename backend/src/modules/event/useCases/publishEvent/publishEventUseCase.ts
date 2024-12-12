import { UseCase } from "@shared/UseCase";
import { IEventManager } from "../../services/eventManager/IEventManager";
import { Result } from "@shared/Response";
import { Event } from "../../domain/Event";

export class PublishEventUseCase implements UseCase<Event, Promise<Result<void>>> {
    private _eventManager: IEventManager;

    constructor(eventManager: IEventManager) {
        this._eventManager = eventManager;
    }

    async execute(event: Event): Promise<Result<void>> {
        try {
            await this._eventManager.putEvent(event);

            return Result.ok<void>();
        } catch (error) {
            return Result.fail<void>(error);
        }
    }
}
