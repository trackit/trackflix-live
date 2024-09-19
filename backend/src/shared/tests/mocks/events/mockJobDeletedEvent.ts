import { DomainEvent } from "@shared/DomainEvent";
import { UniqueEntityID } from "@shared/UniqueEntityID";

export class MockJobDeletedEvent implements DomainEvent {
  dateTimeOccurred: Date;
  id: UniqueEntityID;

  constructor (id: UniqueEntityID) {
    this.dateTimeOccurred = new Date();
    this.id = id;
  }

  getAggregateId (): UniqueEntityID {
    return this.id;
  }
}
