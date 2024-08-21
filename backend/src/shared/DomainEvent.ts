import {UniqueEntityID} from "@shared/UniqueEntityID";

export interface DomainEvent {
    dateTimeOccurred: Date;
    getAggregateId(): UniqueEntityID;
}