import { ValueObject } from "@shared/ValueObject";
import { Errors } from "../enums/Errors";

interface SourceNameProps {
    name: string;
}

export class SourceName extends ValueObject<SourceNameProps> {
    get name(): string {
        return this.props.name;
    }


    private constructor (props: SourceNameProps) {
        super(props);
    }

    public static create(props: SourceNameProps) {
        if (props === undefined || !props.name) {
            throw new Error(Errors.SOURCE_NAME_MUST_BE_PROVIDED);
        } else if (props.name.length < 2) {
            throw new Error(Errors.SOURCE_NAME_MUST_BE_AT_LEAST_2_CHARACTERS_LONG);
        }
        return new SourceName(props);
    }
}
