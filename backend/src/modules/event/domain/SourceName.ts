import { ValueObject } from "@shared/ValueObject";
import { Errors } from "../enums/Errors";
import { Result } from "@shared/Response";
import { Guard } from "@shared/Guard";

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

    public static create(props: SourceNameProps): Result<SourceName> {
        if (!Guard.againstNullOrUndefined({ name: 'name', value: props.name }).isSuccess)
            return Result.fail<SourceName>(Errors.SOURCE_NAME_MUST_BE_PROVIDED);
        else if (props.name.length < 2)
            return Result.fail<SourceName>(Errors.SOURCE_NAME_MUST_BE_AT_LEAST_2_CHARACTERS_LONG);

        return Result.ok<SourceName>(new SourceName(props));
    }
}
