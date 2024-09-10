import {EventStatus} from "../enums/EventStatus";
import {UniqueEntityID} from "@shared/UniqueEntityID";
import {Source} from "./Source";
import {AggregateRoot} from "@shared/AggregateRoot";
import {EventCreatedEvent} from "./events/eventCreatedEvent";
import { EventName } from "./EventName";
import { EventDescription } from "./EventDescription";
import { EventDate } from "./EventDate";
import { Errors } from "../enums/Errors";

interface EventProps {
    name: EventName;
    description: EventDescription;
    onAirStartTime: EventDate;
    onAirEndTime: EventDate;
    status: EventStatus;
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
        if (props === undefined || !props.source) {
            throw new Error(Errors.EVENT_MUST_HAVE_A_SOURCE);
        }
        const event = new Event(props, id);
        const isNewlyCreated = !!id === false;

        if (isNewlyCreated) {
            event.addDomainEvent(new EventCreatedEvent(event.id))
        }
        return event;
    }
}
