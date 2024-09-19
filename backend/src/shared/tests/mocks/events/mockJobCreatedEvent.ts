import { DomainEvent } from "@shared/DomainEvent";
import { UniqueEntityID } from "@shared/UniqueEntityID";

export class MockJobCreatedEvent implements DomainEvent {
  dateTimeOccurred: Date;
  id: UniqueEntityID;

  constructor (id: UniqueEntityID) {
    this.id = id;
    this.dateTimeOccurred = new Date();
  }

  getAggregateId (): UniqueEntityID {
    return this.id;
  }
}
