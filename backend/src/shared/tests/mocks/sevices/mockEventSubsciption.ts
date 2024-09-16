
import { Handle } from "@shared/Handle";
import { DomainEvents } from "@shared/DomainEvents";
import { MockJobCreatedEvent } from "../events/mockJobCreatedEvent";
import { MockJobDeletedEvent } from "../events/mockJobDeletedEvent";

export class MockEventSubsciption implements Handle<MockJobCreatedEvent>, Handle<MockJobDeletedEvent> {
  constructor () {

  }

  /**
   * This is how we may setup subscriptions to domain events.
   */

  setupSubscriptions (): void {
    DomainEvents.register(this.handleJobCreatedEvent, MockJobCreatedEvent.name);
    DomainEvents.register(this.handleDeletedEvent, MockJobDeletedEvent.name);
  }

  /**
   * These are examples of how we define the handlers for domain events.
   */

  handleJobCreatedEvent (event: MockJobCreatedEvent): void {
    // console.log('A job was created!!!')
  }

  handleDeletedEvent (event: MockJobDeletedEvent): void {
    // console.log('A job was deleted!!!')
  }
}
