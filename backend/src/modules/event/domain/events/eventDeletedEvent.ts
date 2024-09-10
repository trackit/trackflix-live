import {DomainEvent} from "@shared/DomainEvent";
import {UniqueEntityID} from "@shared/UniqueEntityID";

export class EventDeletedEvent implements DomainEvent {
    public dateTimeOccurred: Date;
    public eventId: UniqueEntityID;

    constructor(eventId: UniqueEntityID) {
        this.eventId = eventId;
    }

    public getAggregateId(): UniqueEntityID {
        return this.eventId;
    }
}
