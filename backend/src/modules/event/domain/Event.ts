import {EventStatus} from "../enums/EventStatus";
import {UniqueEntityID} from "@shared/UniqueEntityID";
import {Source} from "./Source";
import {AggregateRoot} from "@shared/AggregateRoot";
import {EventCreatedEvent} from "./events/eventCreatedEvent";
import { EventName } from "./EventName";
import { EventDescription } from "./EventDescription";
import { EventDate } from "./EventDate";
import { Errors } from "../enums/Errors";
import {Result} from "@shared/Response";
import {Guard} from "@shared/Guard";
import {SourceProtocol} from "../enums/SourceProtocol";

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

    static create(props: EventProps, id?: UniqueEntityID): Result<Event> {
        const guardProps = [
            { name: 'name', value: props.name },
            { name: 'description', value: props.description },
            { name: 'onAirStartTime', value: props.onAirStartTime },
            { name: 'onAirEndTime', value: props.onAirEndTime },
            { name: 'status', value: props.status },
            { name: 'source', value: props.source },
        ];

        if (!Guard.againstNullOrUndefinedBulk(guardProps).isSuccess)
            return Result.fail<Event>(Errors.EVENT_VALUES_MUST_BE_DEFINED);

        if (!Guard.isMemberOf(guardProps[4], Object.values(Object.values(EventStatus))).isSuccess)
            return Result.fail<Event>(Errors.EVENT_STATUS_MUST_BE_VALID);

        const event = new Event(props, id);
        const isNewlyCreated = !!id === false;

        try {
            if (isNewlyCreated) {
                event.addDomainEvent(new EventCreatedEvent(event.id))
            }
        } catch (e: any) {
            return Result.fail<Event>(Errors.EVENT_ADD_DOMAIN_EVENT_ERROR);
        }

        return Result.ok<Event>(event);
    }
}
