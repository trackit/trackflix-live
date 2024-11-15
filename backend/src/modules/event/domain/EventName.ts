import { ValueObject } from "@shared/ValueObject";
import { Errors } from "../enums/Errors";
import {Result} from "@shared/Response";

interface EventNameProps {
    name: string;
}

export class EventName extends ValueObject<EventNameProps> {
    get name(): string {
        return this.props.name;
    }

    private constructor (props: EventNameProps) {
        super(props);
    }

    public static create(props: EventNameProps): Result<EventName> {
        if (props === undefined || !props.name) {
            return Result.fail<EventName>(Errors.EVENT_NAME_MUST_BE_PROVIDED);
        } else if (props.name.length < 2) {
            return Result.fail<EventName>(Errors.EVENT_NAME_MUST_BE_AT_LEAST_2_CHARACTERS_LONG);
        }
        return Result.ok<EventName>(new EventName(props));
    }
}
