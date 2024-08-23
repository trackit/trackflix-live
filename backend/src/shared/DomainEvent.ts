import { UniqueEntityID } from "./UniqueEntityID";

export interface DomainEvent {
    dateTimeOccurred: Date;
    getAggregateId (): UniqueEntityID;
}