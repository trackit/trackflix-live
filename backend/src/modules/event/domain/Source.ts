import {Entity} from "@shared/Entity";
import {UniqueEntityID} from "@shared/UniqueEntityID";
import {SourceProtocol} from "../enums/SourceProtocol";

interface SourceProps {
    name: string;
    protocol: SourceProtocol;
}

export class Source extends Entity<SourceProps> {
    get name() {
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

    public static create(props: SourceProps, id?: UniqueEntityID) {
        return new Source(props, id)
    }
}
