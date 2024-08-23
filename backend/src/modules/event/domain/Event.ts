import {Entity} from "@shared/Entity";
import {EventStatus} from "../enums/EventStatus";
import {UniqueEntityID} from "@shared/UniqueEntityID";
import {Source} from "./Source";
import {AggregateRoot} from "@shared/AggregateRoot";
import {EventCreatedEvent} from "./events/eventCreatedEvent";

interface EventProps {
    name: string;
    description: string;
    onAirStartTime: Date; // TODO: Should convert to a value object
    onAirEndTime: Date; // TODO: Should convert to a value object
    status: EventStatus
    source: Source;
}

export class Event extends AggregateRoot<EventProps> {
    get name() {
        return this.props.name;
    }

    get description() {
        return this.props.description;
    }

    get onAirStartTime() {
        return this.props.onAirStartTime;
    }

    get onAirEndTime() {
        return this.props.onAirEndTime;
    }

    get status() {
        return this.props.status;
    }

    get source() {
        return this.props.source;
    }

    private constructor(props: EventProps, id?: UniqueEntityID) {
        super(props, id);
    }

    static create(props: EventProps, id?: UniqueEntityID) {
        const event = new Event(props, id);
        const isNewlyCreated = !!id === false;

        if (isNewlyCreated) {
            event.addDomainEvent(new EventCreatedEvent(event.id))
        }
        return event;
    }
}
