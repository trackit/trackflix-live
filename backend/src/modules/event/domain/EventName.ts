import { ValueObject } from "@shared/ValueObject";
import { Errors } from "../enums/Errors";

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

    public static create(props: EventNameProps) {
        if (props === undefined || !props.name) {
            throw new Error(Errors.EVENT_NAME_MUST_BE_PROVIDED);
        } else if (props.name.length < 2) {
            throw new Error(Errors.EVENT_NAME_MUST_BE_AT_LEAST_2_CHARACTERS_LONG);
        }
        return new EventName(props);
    }
}
