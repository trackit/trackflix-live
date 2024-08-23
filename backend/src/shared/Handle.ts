import { DomainEvent } from "./DomainEvent";

export interface Handle<IDomainEvent> {
    setupSubscriptions(): void;
}