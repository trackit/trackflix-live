import { Source } from "src/modules/event/domain/Source";
import { Mapper } from "@shared/Mapper";
import { UniqueEntityID } from "@shared/UniqueEntityID";
import { SourceProtocol } from "src/modules/event/enums/SourceProtocol";
import { SourceName } from "../domain/SourceName";

export class SourceMap extends Mapper<Source> {
  public static toDomain (raw: any): Source {
    return Source.create({
      name: SourceName.create({ name: raw.name }).getValue(),
      protocol: SourceProtocol[raw.protocol]
    }, new UniqueEntityID(raw.vinyl_id)).getValue();
  }

  public static toPersistence (source: Source): any {
    return {
      id: source.id.toString(),
      name: source.name.name,
      protocol: source.protocol
    }
  }
}
