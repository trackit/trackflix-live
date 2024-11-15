import { ValueObject } from "@shared/ValueObject";
import { Errors } from "../enums/Errors";
import {Result} from "@shared/Response";

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

    public static create(props: EventDateProps): Result<EventDate> {
        if (props === undefined || !props.date) {
            return Result.fail<EventDate>(Errors.EVENT_DATE_SHOULD_BE_DEFINED);
        }

        try {
            if (props.date.toISOString() < new Date(Date.now()).toISOString()) {
                return Result.fail<EventDate>(Errors.EVENT_DATE_MUST_NOT_BE_IN_THE_PAST);
            }
        } catch (e: any) {
            return Result.fail<EventDate>(Errors.EVENT_DATE_MUST_BE_ISO_FORMATTED);
        }

        return Result.ok<EventDate>(new EventDate({ date: new Date(props.date) }));
    }
}
