import { FakeEventRepository } from "./fakeEventRepository";
import { Event } from "../../domain/Event";
import { Source } from "../../domain/Source";
import { SourceName } from "../../domain/SourceName";
import { UniqueEntityID } from "@shared/UniqueEntityID";
import { EventName } from "../../domain/EventName";

let repo: FakeEventRepository;
let event: Event;

describe('FakeEventRepository', () => {
  beforeEach(() => {
    repo = null;
  })

  it ('Should be able to add an event', () => {
    repo = new FakeEventRepository();

    repo.addFakeItem(
      Event.create({
        name: undefined,
        description: undefined,
        onAirStartTime: undefined,
        onAirEndTime: undefined,
        status: undefined,
        source: Source.create({ name: SourceName.create({name: "source"}) , protocol: undefined })
      })
    );

    expect(repo['_items'].length).toBe(1);
  })

  it('Should be able to find an event by id', async () => {
    repo = new FakeEventRepository();

    repo.addFakeItem(
      Event.create({
        name: undefined,
        description: undefined,
        onAirStartTime: undefined,
        onAirEndTime: undefined,
        status: undefined,
        source: Source.create({ name: SourceName.create({name: "source"}) , protocol: undefined })
      }, new UniqueEntityID('fake-uuid'))
    );

    repo.addFakeItem(
      Event.create({
        name: undefined,
        description: undefined,
        onAirStartTime: undefined,
        onAirEndTime: undefined,
        status: undefined,
        source: Source.create({ name: SourceName.create({name: "source2"}) , protocol: undefined })
      })
    );

    event = await repo.findById(new UniqueEntityID('fake-uuid'));

    expect(event).toBeTruthy();
    expect(event.source.name.name).toEqual('source');
  })

  it('Should be able to delete an event by id', async () => {
    repo = new FakeEventRepository();

    repo.addFakeItem(
      Event.create({
        name: undefined,
        description: undefined,
        onAirStartTime: undefined,
        onAirEndTime: undefined,
        status: undefined,
        source: Source.create({ name: SourceName.create({name: "source"}) , protocol: undefined })
      }, new UniqueEntityID('fake-uuid'))
    );

    repo.addFakeItem(
      Event.create({
        name: undefined,
        description: undefined,
        onAirStartTime: undefined,
        onAirEndTime: undefined,
        status: undefined,
        source: Source.create({ name: SourceName.create({name: "source2"}) , protocol: undefined })
      })
    );

    event = await repo.findById(new UniqueEntityID('fake-uuid'));
    expect(event).toBeTruthy();
    expect(event.source.name.name).toEqual('source');
    
    await repo.deleteEventById(new UniqueEntityID('fake-uuid'));

    expect(repo['_items'].length).toBe(1);

    event = await repo.findById(new UniqueEntityID('fake-uuid'));

    expect(event).toBeFalsy();
  })

  it("Should be able to update an event by id", async () => {
    repo = new FakeEventRepository();

    repo.addFakeItem(
      Event.create({
        name: undefined,
        description: undefined,
        onAirStartTime: undefined,
        onAirEndTime: undefined,
        status: undefined,
        source: Source.create({ name: SourceName.create({name: "source"}) , protocol: undefined })
      }, new UniqueEntityID('fake-uuid'))
    );

    event = await repo.findById(new UniqueEntityID('fake-uuid'));
    expect(event).toBeTruthy();

    event = Event.create({
      name: undefined,
      description: undefined,
      onAirStartTime: undefined,
      onAirEndTime: undefined,
      status: undefined,
      source: Source.create({ name: SourceName.create({name: "source2"}) , protocol: undefined })
    }, new UniqueEntityID('fake-uuid'));

    await repo.updateEventById(event);

    event = await repo.findById(new UniqueEntityID('fake-uuid'));

    expect(event.source.name.name).toEqual('source2');
    expect(repo['_items'].length).toBe(1);
  })
})
