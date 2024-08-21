import {Entity} from "@shared/Entity";
import {UniqueEntityID} from "@shared/UniqueEntityID";
import {DomainEvent} from "@shared/DomainEvent";

export abstract class AggregateRoot<T> extends Entity<T> {
    private _domainEvents: DomainEvent[] = [];

    get id(): UniqueEntityID {
        return this._id;
    }

    get domainEvents(): DomainEvent[] {
        return this._domainEvents;
    }

    protected addDomainEvent (domainEvent: DomainEvent): void {
        // Add the domain event to this aggregate's list of domain events
        this._domainEvents.push(domainEvent);
        // Add this aggregate instance to the domain event's list of aggregates who's
        // events it eventually needs to dispatch.
        // TODO: implement this DomainEvents.markAggregateForDispatch(this);
        // Log the domain event
        this.logDomainEventAdded(domainEvent);
    }

    public clearEvents (): void {
        this._domainEvents.splice(0, this._domainEvents.length);
    }

    private logDomainEventAdded (domainEvent: DomainEvent): void {
        const thisClass = Reflect.getPrototypeOf(this);
        const domainEventClass = Reflect.getPrototypeOf(domainEvent);
        console.info(`[Domain Event Created]:`, thisClass.constructor.name, '==>', domainEventClass.constructor.name)
    }
}