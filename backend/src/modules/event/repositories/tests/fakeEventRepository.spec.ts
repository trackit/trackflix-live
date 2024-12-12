import { FakeEventRepository } from "./fakeEventRepository";
import { Event } from "../../domain/Event";
import { Source } from "../../domain/Source";
import { SourceName } from "../../domain/SourceName";
import { UniqueEntityID } from "@shared/UniqueEntityID";
import { EventName } from "../../domain/EventName";

let repo: FakeEventRepository;
let event: Event;
let eventAttributes1 = {
    name: undefined,
    description: undefined,
    onAirStartTime: undefined,
    onAirEndTime: undefined,
    status: undefined,
    source: Source.create({
        name: SourceName.create({ name: "source-1" }).getValue(),
        protocol: undefined
    }).getValue()
}
let eventAttributes2 = {
    name: undefined,
    description: undefined,
    onAirStartTime: undefined,
    onAirEndTime: undefined,
    status: undefined,
    source: Source.create({
        name: SourceName.create({ name: "source-2" }).getValue(),
        protocol: undefined,
    }).getValue()
}

describe('FakeEventRepository', () => {
  beforeEach(() => {
    repo = null;
  })

  it ('Should be able to add an event', () => {
    repo = new FakeEventRepository();

    repo.addFakeItem(
      Event.create(eventAttributes1).getValue(),
    );

    expect(repo['_items'].length).toBe(1);
  })

  it('Should be able to find an event by id', async () => {
    repo = new FakeEventRepository();

    repo.addFakeItem(
      Event.create(eventAttributes1, new UniqueEntityID('fake-uuid')).getValue(),
    );

    repo.addFakeItem(
      Event.create(eventAttributes2).getValue()
    );

    event = await repo.findById(new UniqueEntityID('fake-uuid'));

    expect(event).toBeTruthy();
    expect(event.source.name.name).toEqual('source');
  })

  it('Should be able to delete an event by id', async () => {
    repo = new FakeEventRepository();

    repo.addFakeItem(
      Event.create(eventAttributes1, new UniqueEntityID('fake-uuid')).getValue(),
    );

    repo.addFakeItem(
      Event.create(eventAttributes2).getValue(),
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
      Event.create(eventAttributes1, new UniqueEntityID('fake-uuid')).getValue(),
    );

    event = await repo.findById(new UniqueEntityID('fake-uuid'));
    expect(event).toBeTruthy();

    event = Event.create(eventAttributes2, new UniqueEntityID('fake-uuid')).getValue();

    await repo.updateEventById(event);

    event = await repo.findById(new UniqueEntityID('fake-uuid'));

    expect(event.source.name.name).toEqual('source2');
    expect(repo['_items'].length).toBe(1);
  })
})
