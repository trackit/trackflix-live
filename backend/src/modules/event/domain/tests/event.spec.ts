import { Errors } from "../../enums/Errors";
import { EventStatus } from "../../enums/EventStatus";
import { SourceProtocol } from "../../enums/SourceProtocol";
import { Event } from "../Event";
import { EventDate } from "../EventDate";
import { EventDescription } from "../EventDescription";
import { EventName } from "../EventName";
import { Source } from "../Source";
import { SourceName } from "../SourceName";

let event: Event;

describe('Event', () => {
  beforeEach (() => {
    event = null;
  })

  it ('Should be able to be created', () => {
    event = Event.create({
      name: EventName.create({ name: 'event' }),
      description: EventDescription.create({ description: 'description' }),
      onAirStartTime: EventDate.create({ date: new Date(2000) }),
      onAirEndTime: EventDate.create({ date: new Date(2000) }),
      status: EventStatus["TX"],
      source: Source.create({
        name: SourceName.create({ name: 'source' }),
        protocol: SourceProtocol["SRT_CALLER"]
      })
    });

    expect(event.name.name).toEqual('event');
    expect(event.description.description).toEqual('description');
    expect(event.onAirStartTime.date).toEqual(new Date(2000));
    expect(event.onAirEndTime.date).toEqual(new Date(2000));
    expect(event.status).toEqual(EventStatus["TX"]);
    expect(event.source.name.name).toEqual('source');
    expect(event.source.protocol).toEqual(SourceProtocol["SRT_CALLER"]);
  })

  it("Event must throw if source don't exists", () => {
    const t = () => {
      event = Event.create({
        name: EventName.create({ name: 'event' }),
        description: EventDescription.create({ description: 'description' }),
        onAirStartTime: EventDate.create({ date: new Date(2000) }),
        onAirEndTime: EventDate.create({ date: new Date(2000) }),
        status: EventStatus["TX"],
        source: undefined
      });
    };
    expect(t).toThrow(Errors.EVENT_MUST_HAVE_A_SOURCE);
  });

  it("Event must throw if onAirStartTime is not provided", () => {
    const t = () => {
      event = Event.create({
        name: EventName.create({ name: 'event' }),
        description: EventDescription.create({ description: 'description' }),
        onAirStartTime: EventDate.create(undefined),
        onAirEndTime: EventDate.create({ date: new Date(2000) }),
        status: EventStatus["TX"],
        source: Source.create({
          name: SourceName.create({ name: 'source' }),
          protocol: SourceProtocol["SRT_CALLER"]
        })
      });
    };
    expect(t).toThrow(Errors.EVENT_MUST_HAVE_A_ONAIRSTARTTIME);
  });
})
