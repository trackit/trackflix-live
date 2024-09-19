import { Event } from "src/modules/event/domain/Event";
import { Mapper } from "../../../shared/Mapper";
import { UniqueEntityID } from "@shared/UniqueEntityID";
import { SourceName } from "../domain/SourceName";
import { EventStatus } from "../enums/EventStatus";
import { SourceMap } from "./SourceMap";
import { EventDescription } from "../domain/EventDescription";
import { EventDate } from "../domain/EventDate";

export class EventMap extends Mapper<Event> {
  public static toDomain (raw: any): Event {
    const event = Event.create({
      name: SourceName.create({ name: raw.name }),
      description: EventDescription.create({ description: raw.description }),
      onAirStartTime: EventDate.create({ date: raw.onAirStartTime }),
      onAirEndTime: EventDate.create({ date: raw.onAirEndTime }),
      status: EventStatus[raw.status],
      source: SourceMap.toDomain(raw.source)
    }, new UniqueEntityID(raw.vinyl_id));

    return event;
  }

  public static toPersistence (event: Event): any {
    return {
      id: event.id.toString(),
      name: event.name.name,
      description: event.description.description,
      onAirStartTime: event.onAirStartTime.date,
      onAirEndTime: event.onAirEndTime.date,
      status: event.status,
      source: SourceMap.toPersistence(event.source)
    }
  }
}
