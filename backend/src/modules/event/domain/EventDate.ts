import { ValueObject } from "@shared/ValueObject";
import { Errors } from "../enums/Errors";

interface EventDateProps {
    date: Date;
}

export class EventDate extends ValueObject<EventDateProps> {
    get date(): Date {
        return this.props.date;
    }

    private constructor (props: EventDateProps) {
        super(props);
    }

    public static create(props: EventDateProps) {
        if (props === undefined || !props.date) {
            throw new Error(Errors.EVENT_MUST_HAVE_A_ONAIRSTARTTIME);
        }
        return new EventDate({date: new Date(props.date)});
    }
}
