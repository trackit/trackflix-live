
import { DomainEvent } from "./DomainEvent";
import { AggregateRoot } from "./AggregateRoot";
import { UniqueEntityID } from "./UniqueEntityID";

export class DomainEvents {
    private static handlersMap = {};
    private static markedAggregates: AggregateRoot<any>[] = [];

    /**
     * @method markAggregateForDispatch
     * @static
     * @desc Called by aggregate root objects that have created domain
     * events to eventually be dispatched when the infrastructure commits
     * the unit of work.
     */

    public static markAggregateForDispatch (aggregate: AggregateRoot<any>): void {
        const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);

        if (!aggregateFound) {
            this.markedAggregates.push(aggregate);
        }
    }

    private static async dispatchAggregateEvents (aggregate: AggregateRoot<any>) {
        await Promise.all(
            aggregate.domainEvents.map(async (event: DomainEvent) => await this.dispatch(event))
        );
    }

    private static removeAggregateFromMarkedDispatchList (aggregate: AggregateRoot<any>) {
        const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));
        this.markedAggregates.splice(index, 1);
    }

    private static findMarkedAggregateByID (id: UniqueEntityID): AggregateRoot<any> {
        let found: AggregateRoot<any> = null;
        for (let aggregate of this.markedAggregates) {
            if (aggregate.id.equals(id)) {
                found = aggregate;
            }
        }

        return found;
    }

    public static async dispatchEventsForAggregate (id: UniqueEntityID) {
        const aggregate = this.findMarkedAggregateByID(id);

        if (aggregate) {
            await this.dispatchAggregateEvents(aggregate);
            aggregate.clearEvents();
            await this.removeAggregateFromMarkedDispatchList(aggregate);
        }
    }

    public static register(callback: (event: DomainEvent) => void, eventClassName: string): void {
        if (!this.handlersMap.hasOwnProperty(eventClassName)) {
            this.handlersMap[eventClassName] = [];
        }
        this.handlersMap[eventClassName].push(callback);
    }

    public static clearHandlers(): void {
        this.handlersMap = {};
    }

    public static clearMarkedAggregates(): void {
        this.markedAggregates = [];
    }

    private static async dispatch (event: DomainEvent) {
        const eventClassName: string = event.constructor.name;

        if (this.handlersMap.hasOwnProperty(eventClassName)) {
            const handlers: any[] = this.handlersMap[eventClassName];
            for (let handler of handlers) {
                await handler(event);
            }
        }
    }
}
