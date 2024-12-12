import { Errors } from "../../enums/Errors";
import { EventStatus } from "../../enums/EventStatus";
import { SourceProtocol } from "../../enums/SourceProtocol";
import { Event } from "../Event";
import { EventDate } from "../EventDate";
import { EventDescription } from "../EventDescription";
import { EventName } from "../EventName";
import { Source } from "../Source";
import { SourceName } from "../SourceName";

/* Initialize event attributes */
const eventName = EventName.create({ name: 'event' }).getValue();
const eventDescription = EventDescription.create({ description: 'description' }).getValue();
const eventOnAirStartTime = EventDate.create({ date: new Date(2000) }).getValue();
const eventOnAirEndTime = EventDate.create({ date: new Date(2000) }).getValue();
const eventStatus = EventStatus["TX"];
const eventSource = Source.create({
  name: SourceName.create({ name: 'source' }).getValue(),
  protocol: SourceProtocol["SRT_CALLER"],
}).getValue();

describe('Event', () => {
  it ('Should be able to be created', () => {
    const event = Event.create({
      name: eventName,
      description: eventDescription,
      onAirStartTime: eventOnAirStartTime,
      onAirEndTime: eventOnAirEndTime,
      status: eventStatus,
      source: eventSource,
    });
    const {
      name,
      description,
      onAirStartTime,
      onAirEndTime,
      status,
      source,
    } = event.getValue();

    expect(name.name).toEqual('event');
    expect(description.description).toEqual('description');
    expect(onAirStartTime.date).toEqual(new Date(2000));
    expect(onAirEndTime.date).toEqual(new Date(2000));
    expect(status).toEqual(EventStatus["TX"]);
    expect(source.name.name).toEqual('source');
    expect(source.protocol).toEqual(SourceProtocol["SRT_CALLER"]);
  })

  it('Should have a defined source', () => {
    const event = Event.create({
      name: eventName,
      description: eventDescription,
      onAirStartTime: eventOnAirStartTime,
      onAirEndTime: eventOnAirEndTime,
      status: eventStatus,
      source: undefined,
    });

    expect(event.isSuccess).toBe(false);
    expect(event.errorValue()).toBe(Errors.EVENT_VALUES_MUST_BE_DEFINED);
  });

  it("Should have a defined status", () => {
    const event = Event.create({
      name: eventName,
      description: eventDescription,
      onAirStartTime: eventOnAirStartTime,
      onAirEndTime: eventOnAirEndTime,
      status: undefined,
      source: eventSource,
    });

    expect(event.isSuccess).toBe(false);
    expect(event.errorValue()).toBe(Errors.EVENT_VALUES_MUST_BE_DEFINED);
  });

  it("Should have a defined onAirEndTime", () => {
    const event = Event.create({
      name: eventName,
      description: eventDescription,
      onAirStartTime: eventOnAirStartTime,
      onAirEndTime: undefined,
      status: eventStatus,
      source: eventSource,
    });

    expect(event.isSuccess).toBe(false);
    expect(event.errorValue()).toBe(Errors.EVENT_VALUES_MUST_BE_DEFINED);
  });

  it("Should have a defined onAirStartTime", () => {
    const event = Event.create({
      name: eventName,
      description: eventDescription,
      onAirStartTime: undefined,
      onAirEndTime: eventOnAirEndTime,
      status: eventStatus,
      source: eventSource,
    });

    expect(event.isSuccess).toBe(false);
    expect(event.errorValue()).toBe(Errors.EVENT_VALUES_MUST_BE_DEFINED);
  });

  it("Should have a defined description", () => {
    const event = Event.create({
      name: eventName,
      description: undefined,
      onAirStartTime: eventOnAirStartTime,
      onAirEndTime: eventOnAirEndTime,
      status: eventStatus,
      source: eventSource,
    });

    expect(event.isSuccess).toBe(false);
    expect(event.errorValue()).toBe(Errors.EVENT_VALUES_MUST_BE_DEFINED);
  });

  it("Should have a defined name", () => {
    const event = Event.create({
      name: undefined,
      description: eventDescription,
      onAirStartTime: eventOnAirStartTime,
      onAirEndTime: eventOnAirEndTime,
      status: eventStatus,
      source: eventSource,
    });

    expect(event.isSuccess).toBe(false);
    expect(event.errorValue()).toBe(Errors.EVENT_VALUES_MUST_BE_DEFINED);
  });

  it("Should have a valid eventStatus", () => {
    const event = Event.create({
      name: eventName,
      description: eventDescription,
      onAirStartTime: eventOnAirStartTime,
      onAirEndTime: eventOnAirEndTime,
      status: "InvalidEventStatus" as EventStatus,
      source: eventSource,
    });

    expect(event.isSuccess).toBe(false);
    expect(event.errorValue()).toBe(Errors.EVENT_STATUS_MUST_BE_VALID);
  });
})
