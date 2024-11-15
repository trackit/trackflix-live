import { ValueObject } from "@shared/ValueObject";
import { Errors } from "../enums/Errors";
import {Result} from "@shared/Response";

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

    public static create(props: EventDescriptionProps): Result<EventDescription> {
        if (props === undefined || !props.description) {
            return Result.fail<EventDescription>(Errors.EVENT_DESCRIPTION_MUST_BE_PROVIDED);
        }

        return Result.ok<EventDescription>(new EventDescription(props));
    }
}
