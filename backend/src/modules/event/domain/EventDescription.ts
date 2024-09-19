import { ValueObject } from "@shared/ValueObject";
import { Errors } from "../enums/Errors";

interface EventDescriptionProps {
    description: string;
}

export class EventDescription extends ValueObject<EventDescriptionProps> {
    get description(): string {
        return this.props.description;
    }

    private constructor (props: EventDescriptionProps) {
        super(props);
    }

    public static create(props: EventDescriptionProps) {
        if (props === undefined || !props.description) {
            throw new Error(Errors.EVENT_DESCRIPTION_MUST_BE_PROVIDED);
        }
        return new EventDescription(props);
    }
}
