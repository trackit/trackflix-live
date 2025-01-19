import { BaseFakeRepo } from "@shared/tests/BaseFakeRepo";
import { Event } from "../../domain/Event";
import { IEventRepository } from "../eventRepository";
import { UniqueEntityID } from "@shared/UniqueEntityID";

export class FakeEventRepository extends BaseFakeRepo<Event> implements IEventRepository {

  constructor () {
    super();
  }

  public async getEventById(eventId: UniqueEntityID): Promise<Event> {
    return this.findById(eventId);
  }

  public async deleteEventById(eventId: UniqueEntityID): Promise<void> {
    this._items = this._items.filter((a) => a.id.toString() !== eventId.toString());
  }

  public async updateEventById(event: Event): Promise<void> {
    const alreadyExists = await this.exists(event);
    if (alreadyExists) {
      const length = this._items.length;
      for (let i = 0; i < length; i++) {
        if (this.compareFakeItems(this._items[i], event)) {
          this._items[i] = event;
        }
      }
    } else {
      this._items.push(event);
    }
  }

  public async findById(eventId: UniqueEntityID): Promise<Event> {
    const matches = this._items.filter((a) => a.id.toString() === eventId.toString());
    if (matches.length === 0) {
      return null;
    } else {
      return matches[0];
    }
  }

  public async exists(event: Event): Promise<boolean> {
    const found = this._items.filter((i) => this.compareFakeItems(i, event));
    return found.length !== 0;
  }

  public async save(event: Event): Promise<Event> {
    const alreadyExists = await this.exists(event);
    if (alreadyExists) {
      this._items.map((i) => {
        if (this.compareFakeItems(i, event)) {
          return event;
        } else {
          return i
        }
      })
    } else {
      this._items.push(event);
    }
    
    return event;
  }

  public compareFakeItems (a: Event, b: Event): boolean {
    return a.id.equals(b.id);
  }
}
