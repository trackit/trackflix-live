import { Entity } from "@shared/Entity";
import { UniqueEntityID } from "@shared/UniqueEntityID";
import { SourceProtocol } from "../enums/SourceProtocol";
import { SourceName } from "./SourceName";
import { Guard } from "@shared/Guard";
import { Result } from "@shared/Response";
import { Errors } from "../enums/Errors";

interface SourceProps {
    name: SourceName;
    protocol: SourceProtocol;
}

export class Source extends Entity<SourceProps> {
    get name() {
        this.props.name.name;
        return this.props.name;
    }

    get id() {
        return this._id;
    }

    get protocol() {
        return this.props.protocol;
    }


    private constructor(props: SourceProps, id?: UniqueEntityID) {
        super(props, id);
    }

    public static create(props: SourceProps, id?: UniqueEntityID): Result<Source> {
        const guardProps = [
            { name: 'name', value: props.name},
            { name: 'protocol', value: props.protocol },
        ];

        if (!Guard.againstNullOrUndefinedBulk(guardProps).isSuccess)
            return Result.fail<Source>(Errors.SOURCE_VALUES_MUST_BE_DEFINED);

        if (!Guard.isMemberOf(guardProps[1], Object.values(Object.values(SourceProtocol))).isSuccess)
            return Result.fail<Source>(Errors.SOURCE_INVALID_PROTOCOL);

        return Result.ok<Source>(new Source(props, id));
    }
}
